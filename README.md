# Maven Dependency Visualization Project

A visualization tool demonstrating the complexity of Maven dependencies and the impracticality of approving all software components individually.

## Purpose

This project creates an interactive visualization of Maven's dependency tree to show why requiring prior approval for "any and all software components" is impractical in enterprise environments.

## Getting Started

1. Ensure all dependencies are installed (see setup.sh)
2. Activate the Python virtual environment: `source src/backend/venv/bin/activate`
3. Run the data extraction script: `python src/backend/scripts/extract_dependencies.py`
4. Start the web server: `python -m http.server`
5. Open a browser at http://localhost:8000
