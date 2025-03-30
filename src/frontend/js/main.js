// Maven Dependency Visualization with collapsible nodes

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing visualization...');
    
    // Load the dependency data
    fetch('../../data/dependencies.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data loaded:', data);
            if (data.nodes.length === 0) {
                throw new Error('No nodes found in data file. Run extract_dependencies.py first.');
            }
            
            // Process the data to create a hierarchical structure
            const hierarchicalData = processDataToHierarchy(data);
            initializeVisualization(hierarchicalData, data);
        })
        .catch(error => {
            console.error('Error loading dependency data:', error);
            document.getElementById('visualization').innerHTML = 
                `<div class="error">Error loading dependency data: ${error.message}</div>`;
        });
});

// Process flat data into a hierarchical structure
function processDataToHierarchy(data) {
    // Create a map of all nodes by ID
    const nodeMap = {};
    data.nodes.forEach(node => {
        nodeMap[node.id] = { 
            ...node, 
            children: [],
            _children: null, // For collapsed children
            collapsed: node.id !== 'maven' // Everything except root node starts collapsed
        };
    });
    
    // Build the hierarchy based on links
    data.links.forEach(link => {
        const source = typeof link.source === 'object' ? link.source.id : link.source;
        const target = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (nodeMap[source] && nodeMap[target]) {
            nodeMap[source].children.push(nodeMap[target]);
        }
    });
    
    // Find the root node (Maven)
    return nodeMap['maven'] || Object.values(nodeMap)[0];
}

function initializeVisualization(root, originalData) {
    const width = document.getElementById('visualization').clientWidth;
    const height = document.getElementById('visualization').clientHeight;
    
    // Create SVG element
    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            svg.attr('transform', event.transform);
        });
    
    d3.select('#visualization svg').call(zoom);
    
    // Set up the tree layout
    const treeLayout = d3.tree()
        .size([360, Math.min(width, height) / 2 - 120])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);
    
    // Converts hierarchical data to d3.hierarchy
    const hierarchy = d3.hierarchy(root);
    
    // Initial layout positioning
    const treeData = treeLayout(hierarchy);
    
    // Links
    const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('path')
        .data(treeData.links())
        .enter().append('path')
        .attr('d', d3.linkRadial()
            .angle(d => d.x / 180 * Math.PI)
            .radius(d => d.y))
        .attr('fill', 'none')
        .attr('stroke', '#999')
        .attr('stroke-width', d => Math.sqrt(d.target.data.value || 1));
    
    // Nodes
    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(treeData.descendants())
        .enter().append('g')
        .attr('transform', d => `translate(${radialPoint(d.x, d.y)})`)
        .on('click', handleNodeClick);
    
    // Add circles to nodes
    node.append('circle')
        .attr('r', 8)
        .attr('fill', d => d.data.color || '#69b3a2')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);
    
    // Add expand/collapse indicators
    node.append('text')
        .attr('dy', 3)
        .attr('x', 0)
        .attr('text-anchor', 'middle')
        .text(d => d.data.children && d.data.children.length > 0 ? '+' : '')
        .style('fill', 'white')
        .style('font-weight', 'bold')
        .style('font-size', '10px');
    
    // Add labels
    node.append('text')
        .attr('dy', 3)
        .attr('x', d => d.x < 180 ? 15 : -15)
        .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
        .text(d => d.data.name)
        .style('font-size', '10px')
        .style('font-weight', d => d.depth === 0 ? 'bold' : 'normal');
    
    // Create legend
    createLegend(originalData);
    
    // Handle node click for expansion/collapse
    function handleNodeClick(event, d) {
        if (d.data.children && d.data.children.length > 0) {
            if (d.data.collapsed) {
                // Expand
                d.data.collapsed = false;
                updateVisualization();
            } else {
                // Collapse
                d.data.collapsed = true;
                updateVisualization();
            }
        }
    }
    
    // Update the visualization after expand/collapse
    function updateVisualization() {
        // Recreate hierarchy with current collapse state
        const updatedHierarchy = d3.hierarchy(root, d => d.collapsed ? [] : d.children);
        const updatedTree = treeLayout(updatedHierarchy);
        
        // Update links
        const updatedLinks = svg.select('.links').selectAll('path')
            .data(updatedTree.links(), d => d.target.data.id);
        
        updatedLinks.exit().remove();
        
        updatedLinks.enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', '#999')
            .attr('stroke-width', d => Math.sqrt(d.target.data.value || 1))
            .merge(updatedLinks)
            .transition()
            .duration(750)
            .attr('d', d3.linkRadial()
                .angle(d => d.x / 180 * Math.PI)
                .radius(d => d.y));
        
        // Update nodes
        const updatedNodes = svg.select('.nodes').selectAll('g')
            .data(updatedTree.descendants(), d => d.data.id);
        
        updatedNodes.exit().remove();
        
        const enterNodes = updatedNodes.enter()
            .append('g')
            .attr('transform', d => `translate(${radialPoint(d.x, d.y)})`);
        
        enterNodes.append('circle')
            .attr('r', 8)
            .attr('fill', d => d.data.color || '#69b3a2')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5);
        
        enterNodes.append('text')
            .attr('dy', 3)
            .attr('x', 0)
            .attr('text-anchor', 'middle')
            .style('fill', 'white')
            .style('font-weight', 'bold')
            .style('font-size', '10px');
            
        enterNodes.append('text')
            .attr('dy', 3)
            .attr('x', d => d.x < 180 ? 15 : -15)
            .attr('text-anchor', d => d.x < 180 ? 'start' : 'end')
            .style('font-size', '10px')
            .style('font-weight', d => d.depth === 0 ? 'bold' : 'normal');
        
        updatedNodes.merge(enterNodes)
            .transition()
            .duration(750)
            .attr('transform', d => `translate(${radialPoint(d.x, d.y)})`);
        
        updatedNodes.merge(enterNodes).select('circle')
            .attr('fill', d => d.data.color || '#69b3a2');
        
        updatedNodes.merge(enterNodes).select('text:nth-child(2)')
            .text(d => {
                if (d.data.children && d.data.children.length > 0) {
                    return d.data.collapsed ? '+' : '-';
                }
                return '';
            });
        
        updatedNodes.merge(enterNodes).select('text:nth-child(3)')
            .text(d => d.data.name)
            .attr('x', d => d.x < 180 ? 15 : -15)
            .attr('text-anchor', d => d.x < 180 ? 'start' : 'end');
    }
    
    // Connect expand/collapse all buttons
    document.getElementById('expand-all').addEventListener('click', function() {
        expandCollapseAll(root, false);
        updateVisualization();
    });
    
    document.getElementById('collapse-all').addEventListener('click', function() {
        expandCollapseAll(root, true);
        root.collapsed = false; // Keep root expanded
        updateVisualization();
    });
    
    function expandCollapseAll(node, collapseState) {
        node.collapsed = collapseState;
        if (node.children) {
            node.children.forEach(child => expandCollapseAll(child, collapseState));
        }
    }
}

// Helper function to convert from radial to Cartesian coordinates
function radialPoint(angle, radius) {
    angle = angle / 180 * Math.PI - Math.PI / 2;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

// Create legend for maintainers
function createLegend(data) {
    const maintainerLegend = document.getElementById('maintainer-legend');
    if (!maintainerLegend) return;
    
    maintainerLegend.innerHTML = '';
    
    // Get unique maintainers with their colors
    const maintainers = {};
    data.nodes.forEach(node => {
        if (node.maintainer && !maintainers[node.maintainer]) {
            maintainers[node.maintainer] = node.color || '#ccc';
        }
    });
    
    // Create legend items
    Object.entries(maintainers).forEach(([maintainer, color]) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = color;
        
        const text = document.createElement('span');
        text.textContent = maintainer;
        
        item.appendChild(colorBox);
        item.appendChild(text);
        maintainerLegend.appendChild(item);
    });
}