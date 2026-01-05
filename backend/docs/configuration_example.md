# Visual Tools Configuration Example

## Environment Variables

### R Configuration

```bash
# R interpreter path (default: "Rscript")
export R_INTERPRETER="/usr/local/bin/Rscript"

# R library paths
export R_LIBS_USER="/usr/local/lib/R/site-library"
export R_HOME="/usr/local/lib/R"

# Optional: R package installation path
export R_LIBS_SITE="/usr/local/lib/R/library"
```

### Python Configuration

```bash
# Python interpreter path (default: "python")
export PYTHON_INTERPRETER="/usr/local/bin/python3"

# Python path configuration
export PYTHONPATH="/usr/local/lib/python3.9/site-packages"

# Python environment
export PYTHONUNBUFFERED="1"
export PYTHONDONTWRITEBYTECODE="1"
```

## Docker Configuration

### Dockerfile Example

```dockerfile
FROM python:3.9-slim

# Install R
RUN apt-get update && apt-get install -y \
    r-base \
    r-base-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install matplotlib pandas numpy scipy

# Install R packages
RUN R -e "install.packages(c('ggplot2', 'jsonlite', 'readr', 'dplyr'), repos='https://cran.rstudio.com/')"

# Set environment variables
ENV R_INTERPRETER="Rscript"
ENV PYTHON_INTERPRETER="python3"
ENV PYTHONUNBUFFERED="1"
```

### Docker Compose Example

```yaml
version: "3.8"
services:
  app:
    build: .
    environment:
      - R_INTERPRETER=/usr/bin/Rscript
      - PYTHON_INTERPRETER=/usr/bin/python3
      - R_LIBS_USER=/usr/local/lib/R/site-library
      - PYTHONPATH=/usr/local/lib/python3.9/site-packages
    volumes:
      - ./scripts:/app/scripts
      - ./static:/app/static
```

## Development Configuration

### Local Development Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install matplotlib pandas numpy scipy

# Install R (macOS with Homebrew)
brew install r

# Install R packages
R -e "install.packages(c('ggplot2', 'jsonlite', 'readr', 'dplyr'), repos='https://cran.rstudio.com/')"

# Set environment variables for development
export R_INTERPRETER="Rscript"
export PYTHON_INTERPRETER="python"
```

## Production Configuration

### System Requirements

- **R**: Version 4.0 or higher
- **Python**: Version 3.8 or higher
- **Memory**: Minimum 2GB RAM
- **Storage**: 1GB for packages and temporary files

### Security Considerations

- Limit script execution time
- Validate input parameters
- Sanitize file paths
- Use non-root user for script execution
- Monitor resource usage

### Performance Tuning

```bash
# Increase R memory limit
export R_MAX_MEMORY="4G"

# Set Python optimization flags
export PYTHONOPTIMIZE="1"

# Configure matplotlib backend
export MPLBACKEND="Agg"
```

## Troubleshooting

### Common Issues

#### R Script Not Found

```bash
# Check R installation
which Rscript
Rscript --version

# Check R package installation
R -e "library(ggplot2)"
```

#### Python Script Not Found

```bash
# Check Python installation
which python3
python3 --version

# Check Python package installation
python3 -c "import matplotlib; print(matplotlib.__version__)"
```

#### Permission Issues

```bash
# Ensure scripts are executable
chmod +x scripts/visual/*/run.R
chmod +x scripts/visual/*/run.py

# Check directory permissions
ls -la scripts/visual/
```

#### Memory Issues

```bash
# Monitor memory usage
top -p $(pgrep -f "Rscript\|python")

# Increase swap space if needed
sudo swapon --show
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL="DEBUG"

# Run with verbose output
export R_VERBOSE="1"
export PYTHONUNBUFFERED="1"
```
