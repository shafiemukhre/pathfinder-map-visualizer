import { useEffect, useState, useRef } from "react";
import Node from "./Node";
import { dijkstra, getNodesInShortestPathOrderFromDijkstra } from "@algorithms/dijkstra";
import { bfs, getNodesInShortestPathOrderFromBFS } from "@algorithms/bfs";
import { dfs, getNodesInShortestPathOrderFromDFS } from "@algorithms/dfs";
import { bidirectionalSearch, getNodesInShortestPathOrderFromBidirectional } from "@algorithms/bdfs";

interface NodeObject {
  col: number,
  row: number,
  isStart: boolean,
  isFinish: boolean,
  isVisited: boolean,
  isWall: boolean,
}

export default function Grid() {
  const [grid, setGrid] = useState<NodeObject[][]>([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const nodeRefs = useRef<{ [key: string]: HTMLTableCellElement | null }>({});
  const timeouts = useRef<any[]>([]);

  useEffect(() => {
    setGrid(getInitialGrid())
  },[]) // only once


  function handleMouseDown(row: number, col: number) {
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setMouseIsPressed(true)
    setGrid(newGrid)
  }

  function handleMouseEnter(row: number, col: number) {
    if (!mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid)
  }

  function handleMouseUp() {
    setMouseIsPressed(false);
  }

  function animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {

      // finale shortest path line
      if (i === visitedNodesInOrder.length) {
        const timeout = setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
        }, 20 * i);
        timeouts.current.push(timeout);
      }

      // in-progress animation
      const timeout = setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (node) {
          node.isVisited = true; // Update the state of the node
          const nodeRefKey = `node-${node.row}-${node.col}`;
          if (!node.isStart && !node.isFinish && nodeRefs.current[nodeRefKey]) {
            nodeRefs.current[nodeRefKey].className = 'node node-visited';
          }
        }
      }, 20 * i);
      timeouts.current.push(timeout);
    }
  }

  function animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const timeout = setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const nodeRefKey = `node-${node.row}-${node.col}`;
        if (!node.isStart && !node.isFinish && nodeRefs.current[nodeRefKey]) {
          nodeRefs.current[nodeRefKey].className = 'node node-shortest-path'
        }
      }, 20 * i);
      timeouts.current.push(timeout);
    }
    
  }

  function clearGrid() {
    const newGrid = grid.map(row => 
      row.map(node => ({
        ...node,
        isVisited: false,
        distance: Infinity,
        previousNode: null,
        className: node.isWall ? 'node node-wall' : 'node'
      }))
    );

    for (const row of newGrid) {
      for (const node of row) {
        const nodeRefKey = `node-${node.row}-${node.col}`;
        if (!node.isStart && !node.isFinish && nodeRefs.current[nodeRefKey]) {
          nodeRefs.current[nodeRefKey].className = node.className;
        }
      }
    }

    setGrid(newGrid);
  }

  function clearTimeouts() {
    timeouts.current.forEach(timeout => clearTimeout(timeout));
    timeouts.current = [];
  }

  function resetGrid() {
    clearTimeouts();
    const newGrid = grid.map(row => 
      row.map(node => ({
        ...node,
        isVisited: false,
        distance: Infinity,
        previousNode: null,
        isWall: false,
        className: 'node'
      }))
    );

    for (const row of newGrid) {
      for (const node of row) {
        const nodeRefKey = `node-${node.row}-${node.col}`;
        if (!node.isStart && !node.isFinish && nodeRefs.current[nodeRefKey]) {
          nodeRefs.current[nodeRefKey].className = node.className;
        }
      }
    }

    setGrid(newGrid);
  }

  function visualizeAlgorithm(algorithm: string) {
    clearTimeouts();
    clearGrid();
    let visitedNodesInOrder: NodeObject[];
    let nodesInShortestPathOrder: NodeObject[];

    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];

    switch (algorithm) {
      case 'dijkstra':
        visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
        nodesInShortestPathOrder = getNodesInShortestPathOrderFromDijkstra(finishNode);
        break;
      // case 'a-star':
      //   // todo
      //   visitedNodesInOrder = astar(grid, startNode, finishNode);
      //   nodesInShortestPathOrder = getNodesInShortestPathOrderFromAstar(finishNode);
      //   break;
      case 'greedy-bfs':
        visitedNodesInOrder = bfs(grid, startNode, finishNode);
        nodesInShortestPathOrder = getNodesInShortestPathOrderFromBFS(finishNode);
        break;
      case 'bidirectional-swarm':
        visitedNodesInOrder = bidirectionalSearch(grid, startNode, finishNode);
        nodesInShortestPathOrder = getNodesInShortestPathOrderFromBidirectional(finishNode);
        break;
      case 'dfs':
        visitedNodesInOrder = dfs(grid, startNode, finishNode);
        nodesInShortestPathOrder = getNodesInShortestPathOrderFromDFS(finishNode);
        break;
      default:
        console.error('Unknown algorithm:', algorithm);
        return;
    }

    animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  return (
    <>
    <div className="buttons-wrapper">
      <button type="button" onClick={() => visualizeAlgorithm("dijkstra")}>Visualize Dijkstra</button>
      {/* <button type="button" onClick={() => visualizeAlgorithm("a-star")}>Visualize A*</button> */}
      <button type="button" onClick={() => visualizeAlgorithm("greedy-bfs")}>Greedy BFS</button>
      <button type="button" onClick={() => visualizeAlgorithm("bidirectional-swarm")}>Visualize Bidirectional Swarm</button>
      <button type="button" onClick={() => visualizeAlgorithm("dfs")}>Visualize DFS</button>
      <button type="button" onClick={() => resetGrid()}>Reset</button>
    </div>
    <table className="grid">
      <tbody>
        {grid.map((row) => (
          <tr key={`row-${row[0].row}`}>
            {row.map((node) => {
              const {row, col, isFinish, isStart, isVisited, isWall} = node;
              const nodeRefKey = `node-${row}-${col}`;
              return (
                <Node
                  key={`node-${row}-${col}`}
                  row={row}
                  col={col}
                  isFinish={isFinish}
                  isStart={isStart}
                  isVisited={isVisited}
                  ref={(el) => (nodeRefs.current[nodeRefKey] = el)}
                  isWall={isWall}
                  onMouseDown={(row, col) => handleMouseDown(row, col)}
                  onMouseEnter={(row, col) => handleMouseEnter(row, col)}
                  onMouseUp={() => handleMouseUp()}
                />
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
    </>
  )
}

function getInitialGrid() {
  const ROWS = 20;
  const COLS = 40;

  const grid: Array<Array<NodeObject>> = [];
  for (let row = 0; row < ROWS; row++) {
    const currentRow: NodeObject[] = [];
    for (let col = 0; col < COLS; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
}

const START_NODE_ROW = 10;
const START_NODE_COL = 5;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

function createNode(col: number, row: number) {
  return {
    row,
    col,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Number.POSITIVE_INFINITY,
    isVisited: false,
    previousNode: null,
    isWall: false,
  }
}

function getNewGridWithWallToggled(grid, row, col) {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
