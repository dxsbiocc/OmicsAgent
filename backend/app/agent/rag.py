"""
RAG (Retrieval-Augmented Generation) module for Visual Agent.
This module provides knowledge retrieval from visualization tool documentation and R scripts using LlamaIndex.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

try:
    from llama_index.core import (
        VectorStoreIndex,
        Document,
        StorageContext,
        Settings,
        load_index_from_storage,
    )
    from llama_index.core.node_parser import SimpleNodeParser
    from llama_index.vector_stores.faiss import FaissVectorStore
except ImportError:
    # Fallback for older versions
    from llama_index import (
        VectorStoreIndex,
        Document,
        StorageContext,
        Settings,
        load_index_from_storage,
    )
    from llama_index.node_parser import SimpleNodeParser
    from llama_index.vector_stores import FaissVectorStore

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("visual_rag")


@dataclass
class ToolDocument:
    """Document for a visualization tool"""

    tool_id: str  # e.g., "scatter/volcano"
    name: str
    description: str
    category: str
    meta_content: Dict[str, Any]
    doc_content: Optional[str] = None
    r_script_content: Optional[str] = None  # R script content if exists


class VisualRAG:
    """
    RAG system for retrieving visualization tool knowledge using LlamaIndex.

    This class:
    1. Loads and indexes visualization tool documentation and R scripts
    2. Provides semantic search over tool documentation
    3. Returns relevant context for agent prompts
    4. Supports persistent storage of the index
    """

    def __init__(
        self,
        visual_root: Optional[Path] = None,
        scripts_root: Optional[Path] = None,
        persist_dir: Optional[Path] = None,
    ):
        """
        Initialize the RAG system.

        Args:
            visual_root: Path to visual tools directory. Defaults to settings.visual_root
            scripts_root: Path to scripts directory. Defaults to settings.scripts_root
            persist_dir: Path to persist the index. If None, uses in-memory storage.
        """
        self.visual_root = visual_root or settings.visual_root
        self.scripts_root = scripts_root or settings.scripts_root
        # Use static_root if available, otherwise use a default path
        if persist_dir:
            self.persist_dir = persist_dir
        else:
            # Try to use static_root, fallback to visual_root parent
            try:
                self.persist_dir = settings.static_root / "rag_index"
            except AttributeError:
                self.persist_dir = self.visual_root.parent / "rag_index"
        self.index: Optional[VectorStoreIndex] = None
        self.tool_documents: List[ToolDocument] = []
        self.embed_model = None
        self._setup_embeddings()

    def _setup_embeddings(self):
        """
        Setup embeddings model.

        Note: DeepSeek does not support embedding API. This function will try:
        1. OpenAI embeddings (if OPENAI_API_KEY is set)
        2. SiliconFlow embeddings (if SILICONFLOW_API_KEY is set, may provide OpenAI-compatible embeddings)
        3. HuggingFace embeddings (local model, no API key required)
        """
        embed_model = None

        try:
            # Priority 1: Try OpenAI embeddings (best quality)
            if settings.openai_api_key and settings.openai_api_key.strip():
                try:
                    from llama_index.embeddings.openai import OpenAIEmbedding

                    embed_model = OpenAIEmbedding(
                        api_key=settings.openai_api_key.strip(),
                        model="text-embedding-3-small",
                    )
                    # Test the embedding model by getting dimension
                    _ = embed_model.get_query_embedding_dimension()
                    logger.info("Using OpenAI embeddings for RAG")
                except ImportError:
                    # Fallback for older versions
                    try:
                        from llama_index.embeddings import OpenAIEmbedding

                        embed_model = OpenAIEmbedding(
                            api_key=settings.openai_api_key.strip(),
                            model="text-embedding-3-small",
                        )
                        # Test the embedding model
                        _ = embed_model.get_query_embedding_dimension()
                        logger.info("Using OpenAI embeddings for RAG")
                    except Exception as e:
                        logger.warning(
                            f"Failed to initialize OpenAI embeddings: {e}. "
                            "Trying alternative embedding options..."
                        )
                        embed_model = None
                except Exception as e:
                    logger.warning(
                        f"Failed to initialize OpenAI embeddings: {e}. "
                        "Trying alternative embedding options..."
                    )
                    embed_model = None

            # Priority 2: Skip SiliconFlow embeddings
            # SiliconFlow does not support OpenAI-compatible embedding models like text-embedding-3-small
            # The error "Model does not exist" (code 20012) indicates SiliconFlow doesn't have this model
            # So we skip SiliconFlow and go directly to HuggingFace if OpenAI is not available

            # Priority 2: Fallback to HuggingFace embeddings (local, no API key required)
            if embed_model is None:
                logger.info(
                    "No OpenAI API key found or initialization failed. "
                    "Attempting to use HuggingFace embeddings (local model)..."
                )
                try:
                    from llama_index.embeddings.huggingface import HuggingFaceEmbedding
                except ImportError:
                    from llama_index.embeddings import HuggingFaceEmbedding

                # Try to initialize HuggingFace embeddings with timeout handling
                try:
                    import os

                    # Set environment variables to use local cache and increase timeout
                    os.environ.setdefault("HF_HUB_DOWNLOAD_TIMEOUT", "30")
                    if hasattr(settings, "static_root"):
                        os.environ.setdefault(
                            "HF_HUB_CACHE", str(settings.static_root / "hf_cache")
                        )
                    else:
                        # Fallback cache location
                        cache_dir = Path.home() / ".cache" / "huggingface"
                        os.environ.setdefault("HF_HUB_CACHE", str(cache_dir))

                    embed_model = HuggingFaceEmbedding(
                        model_name="sentence-transformers/all-MiniLM-L6-v2",
                        trust_remote_code=True,
                    )
                    # Test the embedding model
                    _ = embed_model.get_query_embedding_dimension()
                    logger.info("Using HuggingFace embeddings for RAG (local model)")
                except Exception as hf_error:
                    logger.warning(
                        f"Failed to initialize HuggingFace embeddings: {hf_error}. "
                        "This may be due to network issues or missing dependencies. "
                        "RAG functionality will be disabled. "
                        "To enable RAG, please set OPENAI_API_KEY in your .env file, "
                        "or ensure HuggingFace models can be downloaded."
                    )
                    embed_model = None

        except Exception as e:
            logger.warning(
                f"Failed to setup embeddings: {e}. RAG functionality will be limited."
            )
            embed_model = None

        # Set global embeddings only if we have a valid model
        if embed_model:
            Settings.embed_model = embed_model
            self.embed_model = embed_model
        else:
            logger.warning(
                "No embedding model available. RAG search will be disabled. "
                "Note: DeepSeek does not support embedding API. "
                "To enable RAG, please set one of the following in your .env file: "
                "OPENAI_API_KEY, SILICONFLOW_API_KEY, or ensure HuggingFace models can be downloaded."
            )
            self.embed_model = None

    def load_tool_documents(self) -> List[ToolDocument]:
        """
        Load all visualization tool documents from the visual_root directory.

        Returns:
            List of ToolDocument objects
        """
        if not self.visual_root.exists():
            logger.warning(f"Visual root directory does not exist: {self.visual_root}")
            return []

        documents = []

        # Iterate through category directories
        for category_dir in self.visual_root.iterdir():
            if not category_dir.is_dir():
                continue

            category_name = category_dir.name

            # Iterate through tool directories
            for tool_dir in category_dir.iterdir():
                if not tool_dir.is_dir():
                    continue

                tool_id = f"{category_name}/{tool_dir.name}"

                # Load meta.json
                meta_path = tool_dir / "meta.json"
                meta_content = {}
                if meta_path.exists():
                    try:
                        meta_content = json.loads(meta_path.read_text(encoding="utf-8"))
                    except Exception as e:
                        logger.warning(f"Failed to load meta.json for {tool_id}: {e}")
                        continue

                # Load document.md if exists
                doc_path = tool_dir / "document.md"
                doc_content = None
                if doc_path.exists():
                    try:
                        doc_content = doc_path.read_text(encoding="utf-8")
                    except Exception as e:
                        logger.warning(f"Failed to load document.md for {tool_id}: {e}")

                # Load R script if exists (plot.R or similar)
                r_script_content = None
                for r_file in ["plot.R", "run.R"]:
                    r_path = tool_dir / r_file
                    if r_path.exists():
                        try:
                            r_script_content = r_path.read_text(encoding="utf-8")
                            break
                        except Exception as e:
                            logger.warning(
                                f"Failed to load R script {r_file} for {tool_id}: {e}"
                            )

                # Extract name and description
                name = meta_content.get("name", tool_dir.name)
                description = meta_content.get("description", "")

                doc = ToolDocument(
                    tool_id=tool_id,
                    name=name,
                    description=description,
                    category=category_name,
                    meta_content=meta_content,
                    doc_content=doc_content,
                    r_script_content=r_script_content,
                )
                documents.append(doc)

        self.tool_documents = documents
        logger.info(f"Loaded {len(documents)} tool documents")
        return documents

    def _load_utils_scripts(self) -> Dict[str, str]:
        """
        Load utility R scripts that parse JSON configurations.

        Returns:
            Dictionary mapping script names to their content
        """
        utils_scripts = {}
        if not self.scripts_root or not self.scripts_root.exists():
            logger.warning(
                f"Scripts root directory does not exist: {self.scripts_root}"
            )
            return utils_scripts

        utils_dir = self.scripts_root / "utils"
        if not utils_dir.exists():
            logger.warning(f"Utils directory does not exist: {utils_dir}")
            return utils_scripts

        # Load key utility scripts
        script_files = [
            "build_ggplot.R",
            "build_heatmap.R",
            "plot_ggplot2.R",
            "utils.R",
        ]

        for script_file in script_files:
            script_path = utils_dir / script_file
            if script_path.exists():
                try:
                    content = script_path.read_text(encoding="utf-8")
                    utils_scripts[script_file] = content
                    logger.debug(f"Loaded utility script: {script_file}")
                except Exception as e:
                    logger.warning(f"Failed to load {script_file}: {e}")

        return utils_scripts

    def _create_document_text(self, tool_doc: ToolDocument) -> str:
        """
        Create a text representation of a tool document for indexing.

        Args:
            tool_doc: ToolDocument to convert to text

        Returns:
            Text representation of the document
        """
        parts = []

        # Basic information
        parts.append(f"Tool ID: {tool_doc.tool_id}")
        parts.append(f"Name: {tool_doc.name}")
        parts.append(f"Category: {tool_doc.category}")
        parts.append(f"Description: {tool_doc.description}")

        # Document content
        if tool_doc.doc_content:
            parts.append(f"\nDocumentation:\n{tool_doc.doc_content}")

        # Meta information (structured) - This is the JSON configuration format
        meta = tool_doc.meta_content
        parts.append("\n## JSON Configuration Format:")

        # Extract ggplot2 configuration if available
        if "ggplot2" in meta:
            ggplot2 = meta["ggplot2"]
            parts.append("\n### ggplot2 Configuration Structure:")
            parts.append(
                "The JSON configuration follows this structure to generate R ggplot2 plots:"
            )

            # Mapping
            if "mapping" in ggplot2:
                parts.append(
                    f"\n**Data Mapping (aes):**\n{json.dumps(ggplot2['mapping'], indent=2, ensure_ascii=False)}"
                )
                parts.append(
                    "Mapping defines how data columns map to visual aesthetics (x, y, color, size, etc.)"
                )

            # Layers
            if "layers" in ggplot2:
                parts.append("\n**Layers:**")
                parts.append(
                    "Layers define geometric objects (geoms) and their properties. Each layer has:"
                )
                parts.append(
                    "- type: The geom function name (e.g., 'geom_point', 'geom_text_repel')"
                )
                parts.append("- mapping: Optional layer-specific aesthetic mappings")
                parts.append("- arguments: Arguments passed to the geom function")
                for i, layer in enumerate(
                    ggplot2["layers"][:3]
                ):  # Show first 3 as examples
                    layer_type = layer.get("type", "unknown")
                    parts.append(f"\n  Example Layer {i+1} ({layer_type}):")
                    if "mapping" in layer:
                        parts.append(
                            f"    Mapping: {json.dumps(layer['mapping'], indent=4, ensure_ascii=False)}"
                        )
                    if "arguments" in layer:
                        args = layer["arguments"]
                        key_args = {
                            k: v
                            for k, v in args.items()
                            if k not in ["raster", "resolution"]
                        }
                        if key_args:
                            parts.append(
                                f"    Arguments: {json.dumps(key_args, indent=4, ensure_ascii=False)}"
                            )

            # Scales
            if "scales" in ggplot2:
                parts.append("\n**Scales:**")
                parts.append(
                    "Scales control how data values map to visual properties. Common types:"
                )
                parts.append("- scale_colour_manual: Manual color mapping")
                parts.append("- scale_size_continuous: Continuous size mapping")
                parts.append("- scale_x_continuous / scale_y_continuous: Axis scales")
                for scale in ggplot2["scales"][:2]:  # Show first 2 as examples
                    scale_type = scale.get("type", "unknown")
                    parts.append(f"  Example: {scale_type}")

            # Guides (legends)
            if "guides" in ggplot2:
                parts.append("\n**Guides (Legends):**")
                parts.append(
                    "Guides control legend appearance. Can use 'guide_none' to hide or 'guide_legend' to customize."
                )

            # Labs (labels)
            if "labs" in ggplot2:
                parts.append("\n**Labs (Labels):**")
                parts.append("Labs define plot titles and axis labels.")
                if "arguments" in ggplot2["labs"]:
                    parts.append(
                        f"Example: {json.dumps(ggplot2['labs']['arguments'], indent=2, ensure_ascii=False)}"
                    )

            # Themes
            if "themes" in ggplot2:
                parts.append("\n**Themes:**")
                parts.append(
                    "Themes control overall plot appearance. Can use predefined themes (theme_prism) or custom theme() calls."
                )

        # Extract heatmap configuration if available
        if "heatmap" in meta:
            heatmap = meta["heatmap"]
            parts.append("\n### Heatmap Configuration Structure:")
            parts.append(
                "The JSON configuration follows this structure to generate R ComplexHeatmap plots:"
            )

            if "transform" in heatmap:
                parts.append("\n**Data Transform:**")
                parts.append(
                    f"{json.dumps(heatmap['transform'], indent=2, ensure_ascii=False)}"
                )
                parts.append(
                    "Transform defines how input data is processed (rownames, scaling, log2 transformation, etc.)"
                )

            if "heatmap" in heatmap:
                parts.append("\n**Heatmap Layers:**")
                parts.append(
                    "Each heatmap layer is a Heatmap object with type 'Heatmap' and arguments."
                )
                for i, ht in enumerate(heatmap["heatmap"][:2]):  # Show first 2
                    parts.append(f"  Example Heatmap {i+1}:")
                    if "arguments" in ht:
                        parts.append(
                            f"    {json.dumps(ht['arguments'], indent=4, ensure_ascii=False)}"
                        )

            if "draw" in heatmap:
                parts.append("\n**Draw Settings:**")
                parts.append(
                    f"{json.dumps(heatmap['draw'], indent=2, ensure_ascii=False)}"
                )
                parts.append(
                    "Draw controls how heatmaps are combined (order: 'h' for horizontal, 'v' for vertical)"
                )

        # R script content if available
        if tool_doc.r_script_content:
            parts.append("\n## R Script Implementation:")
            parts.append(
                "This tool uses the following R script to render the plot (for reference):"
            )
            # Include first 50 lines of R script as context
            r_lines = tool_doc.r_script_content.split("\n")[:50]
            parts.append("\n```r")
            parts.append("\n".join(r_lines))
            if len(tool_doc.r_script_content.split("\n")) > 50:
                parts.append("... (truncated)")
            parts.append("```")

        return "\n".join(parts)

    def _create_utils_document_text(self, script_name: str, script_content: str) -> str:
        """
        Create a text representation of a utility R script for indexing.

        Args:
            script_name: Name of the script file
            script_content: Content of the script

        Returns:
            Text representation of the script
        """
        parts = []

        parts.append(f"# Utility Script: {script_name}")
        parts.append(
            "\nThis R script shows how JSON configurations are parsed and converted to R code."
        )
        parts.append("\n## Key Functions and Logic:")

        if script_name == "build_ggplot.R":
            parts.append("\n### build_ggplot(cfg, data, p=None)")
            parts.append(
                "Main function that builds a ggplot2 plot from JSON configuration."
            )
            parts.append("\n**Process:**")
            parts.append("1. Creates base ggplot with mapping from cfg$mapping")
            parts.append(
                "2. Adds layers from cfg$layers (each layer has type and arguments)"
            )
            parts.append("3. Adds scales from cfg$scales")
            parts.append("4. Adds coordinates, facets, guides, labs, themes")
            parts.append("\n**Key Helper Functions:**")
            parts.append("- build_aes(mapping_list): Converts JSON mapping to R aes()")
            parts.append(
                "- build_layer(layer): Converts layer JSON to geom function call"
            )
            parts.append(
                "- build_call(cfg): Recursively converts JSON to R function calls"
            )
            parts.append("\n**JSON Structure Understanding:**")
            parts.append(
                "- Functions are represented as: {'type': 'function_name', 'arguments': {...}}"
            )
            parts.append(
                "- Mapping strings like '-log10(qvalue)' are parsed as R expressions"
            )
            parts.append("- Arrays in arguments become R vectors")
            parts.append("- Nested objects are recursively processed")

        elif script_name == "build_heatmap.R":
            parts.append("\n### build_heatmap(cfg, data)")
            parts.append(
                "Main function that builds a ComplexHeatmap from JSON configuration."
            )
            parts.append("\n**Process:**")
            parts.append("1. Transforms data according to cfg$transform")
            parts.append("2. Builds Heatmap objects from cfg$heatmap array")
            parts.append("3. Combines heatmaps using cfg$draw$order")
            parts.append("\n**Key Functions:**")
            parts.append(
                "- transform_matrix(mat, trans): Applies transformations (log2, scale, split)"
            )
            parts.append("- build_call(cfg): Converts JSON to R function calls")
            parts.append("\n**JSON Structure Understanding:**")
            parts.append(
                "- transform defines data preprocessing (rownames, scale, log2)"
            )
            parts.append("- heatmap array contains Heatmap objects with type 'Heatmap'")
            parts.append(
                "- draw.order controls combination: 'h' for %v% (vertical), 'v' for + (horizontal)"
            )

        elif script_name == "plot_ggplot2.R":
            parts.append("\n### Generic ggplot2 Plot Script")
            parts.append(
                "This script reads JSON params from environment variable VISUAL_PARAMS_JSON"
            )
            parts.append("and generates plots using build_ggplot function.")
            parts.append("\n**Key Points:**")
            parts.append("- Expects params$ggplot2 configuration")
            parts.append("- Reads data from params$data file path")
            parts.append("- Outputs PDF and PNG files")
            parts.append("- Uses width and height from cfg$width and cfg$height")

        # Include actual script content (first 100 lines)
        parts.append("\n## Script Code (for reference):")
        parts.append("```r")
        script_lines = script_content.split("\n")[:100]
        parts.append("\n".join(script_lines))
        if len(script_content.split("\n")) > 100:
            parts.append("... (truncated)")
        parts.append("```")

        return "\n".join(parts)

    def build_index(self, force_rebuild: bool = False):
        """
        Build the vector index from tool documents and utility scripts.

        Args:
            force_rebuild: If True, rebuild the index even if it exists
        """
        # Check if embedding model is available
        if not self.embed_model:
            logger.warning(
                "Cannot build RAG index: No embedding model available. "
                "Please configure OPENAI_API_KEY or SILICONFLOW_API_KEY."
            )
            return

        # Try to load existing index
        if not force_rebuild and self.persist_dir.exists():
            try:
                storage_context = StorageContext.from_defaults(
                    persist_dir=str(self.persist_dir)
                )
                self.index = load_index_from_storage(storage_context)
                logger.info(f"Loaded existing RAG index from {self.persist_dir}")
                return
            except Exception as e:
                logger.warning(f"Failed to load existing index: {e}, rebuilding...")

        # Load documents if not already loaded
        if not self.tool_documents:
            self.load_tool_documents()

        if not self.tool_documents:
            logger.warning("No tool documents to index")
            return

        # Create LlamaIndex documents from tool documents
        llama_docs = []
        for tool_doc in self.tool_documents:
            text = self._create_document_text(tool_doc)
            doc = Document(
                text=text,
                metadata={
                    "tool_id": tool_doc.tool_id,
                    "name": tool_doc.name,
                    "category": tool_doc.category,
                    "description": tool_doc.description,
                    "doc_type": "tool_config",
                },
            )
            llama_docs.append(doc)

        # Load and index utility scripts
        utils_scripts = self._load_utils_scripts()
        for script_name, script_content in utils_scripts.items():
            text = self._create_utils_document_text(script_name, script_content)
            doc = Document(
                text=text,
                metadata={
                    "script_name": script_name,
                    "doc_type": "utility_script",
                },
            )
            llama_docs.append(doc)

        # Create node parser with optimized settings
        node_parser = SimpleNodeParser.from_defaults(
            chunk_size=512,  # Smaller chunks for better retrieval
            chunk_overlap=50,  # Overlap for context preservation
        )

        # Create vector store
        # FaissVectorStore requires a faiss_index parameter in newer versions
        try:
            import faiss

            # Get embedding dimension from the embedding model
            # Try different methods to get dimension
            embed_dim = None
            if hasattr(self.embed_model, "get_query_embedding_dimension"):
                embed_dim = self.embed_model.get_query_embedding_dimension()
            elif hasattr(self.embed_model, "dimension"):
                embed_dim = self.embed_model.dimension
            elif hasattr(self.embed_model, "model_name"):
                # Common embedding dimensions based on model
                model_name = str(self.embed_model.model_name).lower()
                if "text-embedding-3-small" in model_name:
                    embed_dim = 1536
                elif "text-embedding-3-large" in model_name:
                    embed_dim = 3072
                elif "all-minilm" in model_name:
                    embed_dim = 384
                else:
                    embed_dim = 384  # Default fallback
            else:
                embed_dim = 384  # Default fallback

            # Create FAISS index
            faiss_index = faiss.IndexFlatL2(embed_dim)
            vector_store = FaissVectorStore(faiss_index=faiss_index)
            logger.debug(f"Created FaissVectorStore with dimension {embed_dim}")
        except ImportError:
            logger.warning(
                "faiss-cpu library not installed. Installing it is recommended for RAG functionality."
            )
            # Try to create without explicit index (may work in some versions)
            try:
                vector_store = FaissVectorStore()
            except TypeError as e:
                # If FaissVectorStore requires faiss_index, we need to install faiss-cpu
                logger.error(
                    f"FaissVectorStore requires faiss_index parameter: {e}. "
                    "Please install faiss-cpu: pip install faiss-cpu"
                )
                raise ValueError(
                    "FaissVectorStore requires faiss-cpu library. "
                    "Please install it: pip install faiss-cpu"
                ) from e
        except Exception as e:
            logger.error(f"Failed to create FaissVectorStore: {e}")
            raise

        storage_context = StorageContext.from_defaults(vector_store=vector_store)

        # Build index
        self.index = VectorStoreIndex.from_documents(
            llama_docs,
            storage_context=storage_context,
            node_parser=node_parser,
            show_progress=True,
        )

        # Persist index
        if self.persist_dir:
            self.persist_dir.mkdir(parents=True, exist_ok=True)
            self.index.storage_context.persist(persist_dir=str(self.persist_dir))
            logger.info(f"Persisted RAG index to {self.persist_dir}")

        logger.info(
            f"Built vector index with {len(llama_docs)} documents ({len(self.tool_documents)} tools + {len(utils_scripts)} utility scripts)"
        )

    def search(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        """
        Search for relevant tool documentation.

        Args:
            query: Search query
            k: Number of results to return

        Returns:
            List of relevant documents with metadata
        """
        if not self.embed_model:
            logger.debug("RAG search disabled: No embedding model available")
            return []

        if self.index is None:
            logger.warning("Index not built, building now...")
            self.build_index()

        if self.index is None:
            logger.debug("RAG index not available, returning empty results")
            return []

        # Perform similarity search
        retriever = self.index.as_retriever(similarity_top_k=k)
        nodes = retriever.retrieve(query)

        results = []
        for node in nodes:
            results.append(
                {
                    "content": node.text,
                    "metadata": node.metadata,
                    "score": node.score if hasattr(node, "score") else None,
                }
            )

        return results

    def get_relevant_context(self, user_query: str, max_results: int = 3) -> str:
        """
        Get relevant context from tool documentation for a user query.

        Args:
            user_query: User's query
            max_results: Maximum number of relevant documents to return

        Returns:
            Formatted context string for use in prompts
        """
        results = self.search(user_query, k=max_results)

        if not results:
            return ""

        context_parts = ["## Relevant Visualization Tool Documentation:\n"]

        for i, result in enumerate(results, 1):
            metadata = result["metadata"]
            content = result["content"]

            doc_type = metadata.get("doc_type", "unknown")
            if doc_type == "tool_config":
                title = f"{metadata.get('name', 'Unknown')} ({metadata.get('tool_id', 'unknown')})"
            else:
                title = f"Utility Script: {metadata.get('script_name', 'Unknown')}"

            context_parts.append(f"### {i}. {title}")
            if doc_type == "tool_config":
                context_parts.append(
                    f"**Description:** {metadata.get('description', 'N/A')}"
                )
            # Limit content length to avoid token overflow
            content_preview = content[:1500] + "..." if len(content) > 1500 else content
            context_parts.append(f"**Details:**\n{content_preview}")
            context_parts.append("")

        return "\n".join(context_parts)
