#!/usr/bin/env python3
"""
Fix script for dependency extraction path issues
"""

import os
import json
import logging
import sys

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

def main():
    # Get the current script directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Navigate up to the project root (assuming we're in src/backend/scripts)
    project_root = os.path.abspath(os.path.join(current_dir, '..', '..', '..'))
    
    # Define the correct path for dependencies.json
    correct_path = os.path.join(project_root, 'data', 'dependencies.json')
    
    logger.info(f"Project root identified as: {project_root}")
    logger.info(f"Setting correct output path to: {correct_path}")
    
    # Make sure the data directory exists
    os.makedirs(os.path.dirname(correct_path), exist_ok=True)
    
    # Run the extraction script with the correct output path
    cmd = f"python {os.path.join(current_dir, 'extract_dependencies.py')} --output {correct_path}"
    logger.info(f"Running command: {cmd}")
    
    exit_code = os.system(cmd)
    
    if exit_code == 0:
        logger.info(f"Successfully generated dependency data at {correct_path}")
        
        # Verify the file contains valid data
        try:
            with open(correct_path, 'r') as f:
                data = json.load(f)
                nodes_count = len(data.get('nodes', []))
                links_count = len(data.get('links', []))
                logger.info(f"Data file contains {nodes_count} nodes and {links_count} links")
                
                if nodes_count == 0:
                    logger.warning("Warning: No nodes found in the generated data!")
        except Exception as e:
            logger.error(f"Error verifying data file: {e}")
    else:
        logger.error(f"Failed to run extraction script. Exit code: {exit_code}")

if __name__ == "__main__":
    main()
