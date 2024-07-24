export function bidirectionalSearch(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    const startQueue = [startNode];
    const finishQueue = [finishNode];
  
    const startVisited = new Set();
    const finishVisited = new Set();
  
    startVisited.add(startNode);
    finishVisited.add(finishNode);
  
    while (startQueue.length && finishQueue.length) {
      const startCurrentNode = startQueue.shift();
      const finishCurrentNode = finishQueue.shift();
  
      if (startCurrentNode && finishCurrentNode) {
        // Forward search from start
        visitedNodesInOrder.push(startCurrentNode);
        if (startVisited.has(finishCurrentNode)) {
          return visitedNodesInOrder;
        }
  
        const startNeighbors = getUnvisitedNeighbors(startCurrentNode, grid);
        for (const neighbor of startNeighbors) {
          if (!startVisited.has(neighbor)) {
            neighbor.previousNode = startCurrentNode;
            startVisited.add(neighbor);
            startQueue.push(neighbor);
          }
        }
  
        // Backward search from finish
        visitedNodesInOrder.push(finishCurrentNode);
        if (finishVisited.has(startCurrentNode)) {
          return visitedNodesInOrder;
        }
  
        const finishNeighbors = getUnvisitedNeighbors(finishCurrentNode, grid);
        for (const neighbor of finishNeighbors) {
          if (!finishVisited.has(neighbor)) {
            neighbor.previousNode = finishCurrentNode;
            finishVisited.add(neighbor);
            finishQueue.push(neighbor);
          }
        }
  
        // Check if searches meet
        for (const node of startVisited) {
          if (finishVisited.has(node)) {
            return visitedNodesInOrder;
          }
        }
      }
    }
  
    return visitedNodesInOrder;
  }
  
  function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
  }
  
  function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  }
  
  export function getNodesInShortestPathOrderFromBidirectional(startNode, finishNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
  
    while (currentNode) {
      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
  
    currentNode = startNode.previousNode;
  
    while (currentNode) {
      nodesInShortestPathOrder.push(currentNode);
      currentNode = currentNode.previousNode;
    }
  
    return nodesInShortestPathOrder;
  }
  