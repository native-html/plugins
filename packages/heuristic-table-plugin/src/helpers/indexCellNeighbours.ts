import { DisplayCell } from '../shared-types';

type Cell = Pick<DisplayCell, 'x' | 'y' | 'lenX' | 'lenY' | 'tnode'>;
export interface CellNeighbours {
  Right: readonly Cell[];
  Bottom: readonly Cell[];
}

interface Interval {
  cell: Cell;
  order: number;
  start: number;
  end: number;
  maxEnd: number;
}

function indexEdges(cells: readonly Cell[], horizontal: boolean) {
  const edges = new Map<number, Interval[]>();
  cells.forEach((cell, order) => {
    const edge = horizontal ? cell.y : cell.x;
    const start = horizontal ? cell.x : cell.y;
    const end = start + (horizontal ? cell.lenX : cell.lenY);
    const bucket = edges.get(edge) ?? [];
    bucket.push({ cell, order, start, end, maxEnd: end });
    edges.set(edge, bucket);
  });
  for (const bucket of edges.values()) {
    bucket.sort((a, b) => a.start - b.start);
    let maxEnd = -Infinity;
    for (const interval of bucket) {
      maxEnd = Math.max(maxEnd, interval.end);
      interval.maxEnd = maxEnd;
    }
  }
  return edges;
}

function overlapping(
  bucket: Interval[] = [],
  start: number,
  end: number
): Cell[] {
  // Skip intervals ending before this side. Prefix maxima also handle
  // overlapping spans in malformed markup without missing a long interval.
  let low = 0;
  let high = bucket.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (bucket[middle]!.maxEnd <= start) low = middle + 1;
    else high = middle;
  }
  const matches: Interval[] = [];
  for (let i = low; i < bucket.length && bucket[i]!.start < end; i++) {
    if (bucket[i]!.end > start) matches.push(bucket[i]!);
  }
  // Equal-strength border conflicts retain document order, not spatial order.
  return matches.sort((a, b) => a.order - b.order).map(({ cell }) => cell);
}

/** Index geometry once; border styles may change between measurement passes. */
export default function indexCellNeighbours(
  cells: readonly Cell[]
): ReadonlyMap<Cell, CellNeighbours> {
  const leftEdges = indexEdges(cells, false);
  const topEdges = indexEdges(cells, true);
  return new Map(
    cells.map((cell) => [
      cell,
      {
        Right: overlapping(
          leftEdges.get(cell.x + cell.lenX),
          cell.y,
          cell.y + cell.lenY
        ),
        Bottom: overlapping(
          topEdges.get(cell.y + cell.lenY),
          cell.x,
          cell.x + cell.lenX
        )
      }
    ])
  );
}
