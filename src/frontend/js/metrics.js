// Functions to calculate and display metrics

function calculateMetrics(data) {
    // Calculate total dependencies
    const totalDeps = data.nodes.length - 1; // Subtract 1 for the root node (Maven)
    
    // Calculate unique maintainers
    const uniqueMaintainers = new Set();
    data.nodes.forEach(node => {
        if (node.maintainer) {
            uniqueMaintainers.add(node.maintainer);
        }
    });
    
    // Calculate max depth
    let maxDepth = 0;
    function traverseDepth(nodeId, depth, visited = new Set()) {
        if (visited.has(nodeId)) return; // Prevent cycles
        visited.add(nodeId);
        
        maxDepth = Math.max(maxDepth, depth);
        
        // Find all children of this node
        data.links.forEach(link => {
            const source = typeof link.source === 'object' ? link.source.id : link.source;
            const target = typeof link.target === 'object' ? link.target.id : link.target;
            
            if (source === nodeId) {
                traverseDepth(target, depth + 1, new Set(visited));
            }
        });
    }
    
    // Start from Maven node
    const mavenNode = data.nodes.find(node => node.id === 'maven');
    if (mavenNode) {
        traverseDepth(mavenNode.id, 0);
    }
    
    // Calculate estimated approval time (30 minutes per component)
    const approvalTimeMinutes = totalDeps * 30;
    let approvalTimeFormatted;
    
    if (approvalTimeMinutes < 60) {
        approvalTimeFormatted = `${approvalTimeMinutes} min`;
    } else if (approvalTimeMinutes < 24 * 60) {
        const hours = Math.floor(approvalTimeMinutes / 60);
        approvalTimeFormatted = `${hours} hours`;
    } else {
        const days = Math.floor(approvalTimeMinutes / (24 * 60));
        approvalTimeFormatted = `${days} days`;
    }
    
    // Return calculated metrics
    return {
        totalDependencies: totalDeps,
        uniqueMaintainers: uniqueMaintainers.size,
        maxDepth: maxDepth,
        approvalTime: approvalTimeFormatted
    };
}

function displayMetrics(metrics) {
    // Update the DOM with calculated metrics
    document.getElementById('total-dependencies').textContent = metrics.totalDependencies;
    document.getElementById('unique-maintainers').textContent = metrics.uniqueMaintainers;
    document.getElementById('max-depth').textContent = metrics.maxDepth;
    document.getElementById('approval-time').textContent = metrics.approvalTime;
}

// This function should be called after data is loaded
function updateMetricsPanel(data) {
    const metrics = calculateMetrics(data);
    displayMetrics(metrics);
}