"""
Celery tasks for visual tools
"""

import json
import os
import subprocess
import uuid
from pathlib import Path
from typing import Dict, Any

from celery import current_task
from app.core.celery_app import celery_app
from app.core.logging import get_logger

logger = get_logger("visual_tasks")

TOOLS_ROOT = Path("scripts/visual")
OUTPUT_DIR = Path("static/images/visual")


@celery_app.task(bind=True)
def run_visual_tool_task(self, tool: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Background task to run visual tool
    """
    logger.info(f"Starting visual tool task: {tool}")

    # Update task state
    self.update_state(state="PROGRESS", meta={"status": "Initializing", "progress": 10})

    tool_dir = TOOLS_ROOT / tool
    script_path = tool_dir / "run.R"

    if not script_path.exists():
        logger.error(f"R script not found: {script_path}")
        return {"success": False, "message": "R script not found", "tool": tool}

    # Ensure output dir exists per tool
    tool_output_dir = OUTPUT_DIR / tool
    tool_output_dir.mkdir(parents=True, exist_ok=True)

    # Load defaults from meta.json
    meta_path = tool_dir / "meta.json"
    defaults = {}
    if meta_path.exists():
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            defaults = meta.get("defaults", {})
        except Exception as e:
            logger.warning(f"Failed to load meta.json: {e}")

    # Merge params with defaults
    params_with_defaults = defaults.copy()
    params_with_defaults.update(params)

    # Generate unique run ID
    run_id = uuid.uuid4().hex[:12]
    params_json_path = tool_output_dir / f"params_{run_id}.json"
    output_png = tool_output_dir / f"output_{run_id}.png"

    # Update task state
    self.update_state(
        state="PROGRESS", meta={"status": "Preparing parameters", "progress": 30}
    )

    # Write params to JSON file
    params_json_path.write_text(
        json.dumps(params_with_defaults, ensure_ascii=False), encoding="utf-8"
    )

    # Update task state
    self.update_state(
        state="PROGRESS", meta={"status": "Running R script", "progress": 50}
    )

    # Set environment variables
    env = os.environ.copy()
    env["VISUAL_PARAMS_JSON"] = str(params_json_path.resolve())
    env["VISUAL_OUTPUT_PNG"] = str(output_png.resolve())

    try:
        # Run R script
        result = subprocess.run(
            ["Rscript", str(script_path.resolve())],
            check=True,
            cwd=str(tool_dir.resolve()),
            env=env,
            capture_output=True,
            text=True,
            timeout=240,  # 4 minutes timeout
        )

        logger.info(f"R script completed successfully: {result.stdout}")

    except subprocess.TimeoutExpired:
        logger.error(f"R script timed out for tool: {tool}")
        return {
            "success": False,
            "message": "R script execution timed out",
            "tool": tool,
            "used_params": params_with_defaults,
        }
    except subprocess.CalledProcessError as e:
        logger.error(f"R script failed: {e.stderr}")
        return {
            "success": False,
            "message": f"R script failed: {e.stderr}",
            "tool": tool,
            "used_params": params_with_defaults,
        }

    # Update task state
    self.update_state(state="PROGRESS", meta={"status": "Finalizing", "progress": 90})

    # Check if output file was created
    if not output_png.exists():
        logger.error(f"Output image not created: {output_png}")
        return {
            "success": False,
            "message": "Output image not produced",
            "tool": tool,
            "used_params": params_with_defaults,
        }

    # Clean up params file
    try:
        params_json_path.unlink()
    except Exception:
        pass

    # Update task state
    self.update_state(state="PROGRESS", meta={"status": "Completed", "progress": 100})

    image_url = f"/static/images/visual/{tool}/{output_png.name}"

    logger.info(f"Visual tool task completed: {tool}, output: {image_url}")

    return {
        "success": True,
        "message": "ok",
        "image_url": image_url,
        "output_files": [image_url],
        "tool": tool,
        "used_params": params_with_defaults,
    }
