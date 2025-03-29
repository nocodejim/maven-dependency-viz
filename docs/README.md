# Maven Dependency Visualization Documentation

## Overview
This project creates an interactive visualization of Maven's dependency structure to demonstrate 
the complexity and impracticality of requiring prior approval for all software components.

## Setup
1. Run the setup.sh script to install all prerequisites
2. Activate the Python virtual environment
3. Run the dependency extraction script
4. Start the web server

## Project Structure
- `/data`: Contains extracted dependency data
- `/src/frontend`: Web-based visualization
- `/src/backend`: Data extraction and processing scripts
- `/docs`: Documentation
- `/container`: Docker container for deployment

## Development Workflow
1. Extract dependencies with `extract_dependencies.py`
2. Customize visualization in the frontend code
3. Test locally with a simple HTTP server
4. Build and run the Docker container for deployment

## Technologies Used
- D3.js for visualization
- Python for data extraction and processing
- Docker for containerization
