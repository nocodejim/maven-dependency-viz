#!/usr/bin/env python3
"""
Maven Dependency Extraction Script

This script extracts Maven dependencies and their relationships,
including maintainer information for visualization.
"""

import os
import json
import logging
import argparse
import sys
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("dependency_extraction.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Comprehensive maintainer mapping for Maven dependencies
MAINTAINER_MAPPING = {
    # Core Dependencies
    "maven-artifact": "Apache Software Foundation",
    "maven-builder-support": "Apache Software Foundation",
    "maven-core": "Apache Software Foundation",
    "maven-impl": "Apache Software Foundation",
    "maven-embedder": "Apache Software Foundation",
    "maven-cli": "Apache Software Foundation",
    "maven-model": "Apache Software Foundation",
    "maven-model-builder": "Apache Software Foundation",
    "maven-compat": "Apache Software Foundation",
    
    # API Components
    "maven-api-core": "Apache Software Foundation",
    "maven-api-annotations": "Apache Software Foundation",
    "maven-api-model": "Apache Software Foundation",
    "maven-api-settings": "Apache Software Foundation",
    "maven-api-spi": "Apache Software Foundation",
    "maven-api-toolchain": "Apache Software Foundation",
    "maven-api-plugin": "Apache Software Foundation",
    "maven-api-xml": "Apache Software Foundation",
    "maven-api-di": "Apache Software Foundation",
    "maven-api-metadata": "Apache Software Foundation",
    "maven-api-cli": "Apache Software Foundation",
    
    # Resolver Components
    "maven-resolver-api": "Apache Software Foundation",
    "maven-resolver-spi": "Apache Software Foundation",
    "maven-resolver-impl": "Apache Software Foundation",
    "maven-resolver-util": "Apache Software Foundation",
    "maven-resolver-named-locks": "Apache Software Foundation",
    "maven-resolver-connector-basic": "Apache Software Foundation",
    "maven-resolver-provider": "Apache Software Foundation",
    
    # External Libraries
    "guice": "Google",
    "guava": "Google",
    "org.eclipse.sisu.plexus": "Eclipse Foundation",
    "javax.annotation-api": "Jakarta EE",
    "org.eclipse.sisu.inject": "Eclipse Foundation",
    "jakarta.inject-api": "Jakarta EE",
    "asm": "OW2 Consortium",
    "javax.inject": "Eclipse Foundation",
    "commons-cli": "Apache Software Foundation",
    "commons-jxpath": "Apache Software Foundation",
    
    # Logging Components
    "maven-logging": "Apache Software Foundation",
    "slf4j-api": "QOS.ch",
    "slf4j-simple": "QOS.ch",
    "logback-classic": "QOS.ch",
    
    # Building/Testing Components
    "plexus-xml": "Codehaus Plexus/Sonatype",
    "plexus-classworlds": "Codehaus Plexus/Sonatype",
    "plexus-interpolation": "Codehaus Plexus/Sonatype",
    "plexus-sec-dispatcher": "Codehaus Plexus/Sonatype",
    "plexus-testing": "Codehaus Plexus/Sonatype",
    "plexus-utils": "Codehaus Plexus/Sonatype",
    "junit-bom": "JUnit Team",
    "mockito-bom": "Mockito Team",
    "byte-buddy": "Individual Maintainers",
    "hamcrest": "Hamcrest Team",
    "assertj-core": "AssertJ Team",
    
    # IO & Transport
    "maven-resolver-transport-file": "Apache Software Foundation",
    "maven-resolver-transport-apache": "Apache Software Foundation",
    "maven-resolver-transport-jdk": "Apache Software Foundation",
    "maven-resolver-transport-wagon": "Apache Software Foundation",
    "wagon-provider-api": "Apache Software Foundation",
    "wagon-file": "Apache Software Foundation",
    "wagon-http": "Apache Software Foundation",
    "jimfs": "Google",
    
    # UI & Terminal
    "maven-jline": "Apache Software Foundation",
    "jline-reader": "JLine Project",
    "jline-style": "JLine Project",
    "jline-builtins": "JLine Project",
    "jline-console": "JLine Project",
    "jline-console-ui": "JLine Project",
    "jline-terminal": "JLine Project",
    "jline-terminal-ffm": "JLine Project",
    "jline-terminal-jni": "JLine Project",
    "jline-native": "JLine Project",
    "jansi-core": "JLine Project",
    
    # XML Processing
    "maven-xml": "Apache Software Foundation",
    "woodstox-core": "FasterXML",
    "stax2-api": "FasterXML",
    "xmlunit-assertj": "XmlUnit Team",
    "xmlunit-core": "XmlUnit Team",
    "xmlunit-matchers": "XmlUnit Team",
    
    # Common libraries
    "commons-io": "Apache Software Foundation",
    "junit": "JUnit Team"
}

# Color mapping for maintainer organizations
MAINTAINER_COLORS = {
    "Apache Software Foundation": "#3182bd",
    "JLine Project": "#6baed6",
    "Eclipse Foundation": "#9ecae1",
    "Google": "#c6dbef",
    "QOS.ch": "#e6550d",
    "Jakarta EE": "#fd8d3c",
    "FasterXML": "#fdae6b",
    "XmlUnit Team": "#fdd0a2",
    "Codehaus Plexus/Sonatype": "#31a354",
    "JUnit Team": "#74c476",
    "Mockito Team": "#a1d99b",
    "AssertJ Team": "#c7e9c0",
    "Hamcrest Team": "#756bb1",
    "OW2 Consortium": "#9e9ac8",
    "Individual Maintainers": "#bcbddc"
}

def setup_argument_parser():
    """Set up command line argument parser."""
    parser = argparse.ArgumentParser(description='Extract Maven dependencies for visualization')
    parser.add_argument('--output', default='../../data/dependencies.json',
                        help='Output JSON file path')
    parser.add_argument('--depth', type=int, default=3,
                        help='Depth of dependency tree to extract')
    parser.add_argument('--verbose', '-v', action='store_true',
                        help='Enable verbose output')
    return parser

def get_maintainer_info(component_name):
    """Get maintainer and color information for a component."""
    maintainer = MAINTAINER_MAPPING.get(component_name, "Unknown")
    color = MAINTAINER_COLORS.get(maintainer, "#cccccc")  # Default gray for unknown
    return maintainer, color

def get_sample_data():
    """
    Generate sample dependency data for testing.
    In a real implementation, this would extract actual Maven dependencies.
    """
    logger.info("Generating sample dependency data with comprehensive maintainer information")
    
    # First level categories
    categories = [
        "Core Dependencies",
        "API Components",
        "Resolver Components",
        "External Libraries",
        "Logging Components",
        "Building/Testing",
        "IO & Transport",
        "UI & Terminal",
        "XML Processing"
    ]
    
    # Build nodes list with detailed maintainer information
    nodes = [{"id": "maven", "name": "Apache Maven", "maintainer": "Apache Software Foundation", 
              "color": MAINTAINER_COLORS["Apache Software Foundation"]}]
    
    # Add category nodes
    for i, category in enumerate(categories):
        nodes.append({"id": f"category-{i}", "name": category, "type": "category"})
    
    # Core Dependencies components
    core_deps = ["maven-artifact", "maven-builder-support", "maven-core", "maven-impl",
                 "maven-embedder", "maven-cli", "maven-model", "maven-model-builder", "maven-compat"]
    
    # API Components
    api_comps = ["maven-api-core", "maven-api-annotations", "maven-api-model", "maven-api-settings",
                 "maven-api-spi", "maven-api-toolchain", "maven-api-plugin", "maven-api-xml",
                 "maven-api-di", "maven-api-metadata", "maven-api-cli"]
    
    # Resolver Components
    resolver_comps = ["maven-resolver-api", "maven-resolver-spi", "maven-resolver-impl",
                     "maven-resolver-util", "maven-resolver-named-locks",
                     "maven-resolver-connector-basic", "maven-resolver-provider"]
    
    # External Libraries
    ext_libs = ["guice", "guava", "org.eclipse.sisu.plexus", "javax.annotation-api",
                "org.eclipse.sisu.inject", "jakarta.inject-api", "asm", "javax.inject",
                "commons-cli", "commons-jxpath"]
    
    # Logging Components
    logging_comps = ["maven-logging", "slf4j-api", "slf4j-simple", "logback-classic"]
    
    # Building/Testing
    build_test = ["plexus-xml", "plexus-classworlds", "plexus-interpolation",
                  "plexus-sec-dispatcher", "plexus-testing", "junit-bom", "mockito-bom",
                  "byte-buddy", "hamcrest", "assertj-core"]
    
    # IO & Transport
    io_transport = ["maven-resolver-transport-file", "maven-resolver-transport-apache",
                    "maven-resolver-transport-jdk", "maven-resolver-transport-wagon",
                    "wagon-provider-api", "wagon-file", "wagon-http", "jimfs"]
    
    # UI & Terminal
    ui_terminal = ["maven-jline", "jline-reader", "jline-style", "jline-builtins",
                   "jline-console", "jline-console-ui", "jline-terminal", "jline-terminal-ffm",
                   "jline-terminal-jni", "jline-native", "jansi-core"]
    
    # XML Processing
    xml_proc = ["maven-xml", "woodstox-core", "stax2-api", "xmlunit-assertj",
                "xmlunit-core", "xmlunit-matchers"]
    
    # Group components by category
    category_components = [
        core_deps, api_comps, resolver_comps, ext_libs, logging_comps,
        build_test, io_transport, ui_terminal, xml_proc
    ]
    
    # Add component nodes with maintainer information
    links = []
    
    # Add links from Maven to categories
    for i in range(len(categories)):
        links.append({"source": "maven", "target": f"category-{i}", "value": 3})
    
    # Add components and links from categories to components
    for i, components in enumerate(category_components):
        for comp in components:
            maintainer, color = get_maintainer_info(comp)
            nodes.append({
                "id": comp,
                "name": comp,
                "maintainer": maintainer,
                "color": color
            })
            links.append({"source": f"category-{i}", "target": comp, "value": 2})
    
    # Sample data with updated nodes and links
    data = {
        "nodes": nodes,
        "links": links
    }
    
    return data

def extract_maven_dependencies(depth=3):
    """
    Extract Maven dependencies to the specified depth.
    This is a placeholder for the actual implementation.
    """
    logger.info(f"Extracting Maven dependencies to depth {depth}")
    
    # In a real implementation, this would use Maven commands to extract dependencies
    # For now, we'll use sample data
    return get_sample_data()

def save_to_json(data, output_path):
    """Save the dependency data to a JSON file."""
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        logger.info(f"Dependency data saved to {output_path}")
        return True
    except Exception as e:
        logger.error(f"Error saving dependency data: {e}")
        return False

def main():
    """Main function to extract and save Maven dependencies."""
    parser = setup_argument_parser()
    args = parser.parse_args()
    
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    try:
        logger.info("Starting Maven dependency extraction")
        
        # Extract dependencies
        dependency_data = extract_maven_dependencies(args.depth)
        
        # Convert relative path to absolute path
        output_path = os.path.abspath(args.output)
        
        # Save to JSON
        success = save_to_json(dependency_data, output_path)
        
        if success:
            logger.info("Dependency extraction completed successfully")
            logger.info(f"Data saved to {output_path}")
        else:
            logger.error("Failed to save dependency data")
            return 1
        
        return 0
    except Exception as e:
        logger.error(f"An error occurred during dependency extraction: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())