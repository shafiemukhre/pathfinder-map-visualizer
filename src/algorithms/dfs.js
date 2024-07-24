// Performs Depth-First Search; returns *all* nodes in the order
// in which they were visited. Also makes nodes point back to their
// previous node, effectively allowing us to compute the shortest path
// by backtracking from the finish node.
export function dfs(grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    startNode.isVisited = true;
    dfsRecursive(grid, startNode, finishNode, visitedNodesInOrder);
    return visitedNodesInOrder;
  }
  
  function dfsRecursive(grid, node, finishNode, visitedNodesInOrder) {
    // Base case: if we find the finish node, we stop
    if (node === finishNode) {
      visitedNodesInOrder.push(node);
      return true;
    }
  
    visitedNodesInOrder.push(node);
  
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.isVisited = true;
      neighbor.previousNode = node;
      if (dfsRecursive(grid, neighbor, finishNode, visitedNodesInOrder)) {
        return true;
      }
    }
  
    return false;
  }
  
  function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited  && !neighbor.isWall);
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
  
  // Backtracks from the finishNode to find the shortest path.
  // Only works when called *after* the dfs method above.
  export function getNodesInShortestPathOrderFromDFS(finishNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
  }
  