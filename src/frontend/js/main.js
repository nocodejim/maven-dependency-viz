// Maven Dependency Visualization

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing visualization...');
    
    // Load the dependency data
    fetch('../data/dependencies.json')
        .then(response => response.json())
        .then(data => {
            console.log('Data loaded:', data);
            initializeVisualization(data);
        })
        .catch(error => {
            console.error('Error loading dependency data:', error);
            document.getElementById('visualization').innerHTML = 
                '<div class="error">Error loading dependency data. See console for details.</div>';
        });
});

function initializeVisualization(data) {
    const width = document.getElementById('visualization').clientWidth;
    const height = document.getElementById('visualization').clientHeight;
    
    // Create SVG element
    const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create a force-directed layout
    const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Draw links
    const link = svg.append('g')
        .selectAll('line')
        .data(data.links)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(d.value));
    
    // Draw nodes
    const node = svg.append('g')
        .selectAll('circle')
        .data(data.nodes)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('fill', d => d.color || '#69b3a2')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    // Add node labels
    const text = svg.append('g')
        .selectAll('text')
        .data(data.nodes)
        .enter()
        .append('text')
        .text(d => d.name)
        .attr('font-size', 10)
        .attr('dx', 8)
        .attr('dy', 3);
    
    // Update positions on each "tick" of the simulation
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        text
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    });
    
    // Create legend
    createLegend(data);
    
    // Drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

function createLegend(data) {
    const legend = document.getElementById('legend');
    legend.innerHTML = '<h3>Maintainers</h3>';
    
    // Get unique maintainers and their colors
    const maintainers = [...new Set(data.nodes.map(node => node.maintainer))];
    
    maintainers.forEach(maintainer => {
        const color = data.nodes.find(node => node.maintainer === maintainer)?.color || '#ccc';
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <span class="color-box" style="background-color: ${color}"></span>
            <span>${maintainer || 'Unknown'}</span>
        `;
        legend.appendChild(item);
    });
}

// Event listeners for buttons
document.getElementById('expand-all').addEventListener('click', function() {
    console.log('Expand all clicked');
    // Implement expansion logic
});

document.getElementById('collapse-all').addEventListener('click', function() {
    console.log('Collapse all clicked');
    // Implement collapse logic
});
