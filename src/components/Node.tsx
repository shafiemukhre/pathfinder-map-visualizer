import { forwardRef } from 'react';

interface NodeProps {
  row: number,
  col: number,
  isFinish: boolean,
  isStart: boolean,
  isVisited: boolean,
  isWall: boolean,
  onMouseDown: (row: number, col: number) => void,
  onMouseEnter: (row: number, col: number) => void,
  onMouseUp: () => void
}

// TO LEARN: try to understand forwardRef more
const Node = forwardRef<HTMLTableCellElement, NodeProps>(function Node(props, ref) {
  const { row, col, isFinish, isStart, isVisited, isWall, onMouseDown, onMouseEnter, onMouseUp} = props;
  const extraClassName = isFinish
    ? 'node-finish'
    : isStart
    ? 'node-start'
    : isVisited
    ? 'node-visited'
    : isWall
    ? 'node-wall'
    : '';

  return (
    <td
      id={`node-${row}-${col}`}
      className={`node ${extraClassName}`}
      ref={ref}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={() => onMouseUp()}
    />
  );
});

export default Node;
