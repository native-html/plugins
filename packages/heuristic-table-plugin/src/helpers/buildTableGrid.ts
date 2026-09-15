import { TNode } from '@native-html/render';
import { DisplayCell, TableGrid, TCellConstraints } from '../shared-types';
import parseSpan, { MAX_COLSPAN, MAX_ROWSPAN } from './parseSpan';

/**
 * The constraints of a cell no computer has measured yet.
 *
 * @remarks
 * The grid is built before the width its cells must be measured against is
 * known — coordinates and spans do not depend on it, whereas constraints do,
 * and measuring text is the costly half of a layout pass. Every cell carries
 * this placeholder until {@link TableLayout}'s measurement pass replaces it.
 */
const UNMEASURED_CONSTRAINTS: TCellConstraints = Object.freeze({
  contentDensity: 0,
  maxWidth: 0,
  minWidth: 0
});

/**
 * The state of the walk that lays cells down, live only while building.
 *
 * @remarks
 * Kept out of {@link TableGrid}: `offsetX` is meaningless once the last row is
 * placed, and `occupied` is an index nothing downstream reads. Both used to be
 * carried on the result, where the grid's consumers had to look past them.
 */
interface GridCursor {
  /**
   * The slot cursor for the current row. Cells are laid down left to right
   * from wherever the previous one ended, skipping any slot a spanning cell
   * from an earlier row has claimed. Deriving the column from `nodeIndex`
   * instead would let a stray non-cell element inside the row shift every
   * following cell.
   */
  offsetX: number;
  /**
   * Slots claimed by a cell spanning down from an earlier row, keyed `x,y`.
   *
   * @remarks
   * A set rather than a list: this is probed once per slot per cell while
   * scanning for a free column, so a linear scan makes filling a table with
   * row spans quadratic in its cell count.
   */
  occupied: Set<string>;
}

function isOccupied(cursor: GridCursor, x: number, y: number): boolean {
  return cursor.occupied.has(`${x},${y}`);
}

/**
 * Find the first slot in row `y` at or after `fromX` that no spanning cell has
 * already claimed.
 *
 * @remarks
 * The search must advance one slot at a time: counting blockers in a single
 * pass can land the cell on another blocked slot, so two cells end up sharing
 * one coordinate.
 */
function findFreeSlotX(cursor: GridCursor, fromX: number, y: number): number {
  let x = fromX;
  while (isOccupied(cursor, x, y)) {
    x += 1;
  }
  return x;
}

function fill(tnode: TNode, grid: TableGrid, cursor: GridCursor) {
  if (tnode.tagName === 'tr') {
    grid.maxY = grid.maxY + 1;
    cursor.offsetX = 0;
  }
  if (tnode.tagName !== 'th' && tnode.tagName !== 'td') {
    tnode.children.forEach((child) => fill(child, grid, cursor));
    return;
  }
  const lenX = parseSpan(tnode.attributes.colspan, MAX_COLSPAN);
  const lenY = parseSpan(tnode.attributes.rowspan, MAX_ROWSPAN);
  const startY = grid.maxY;
  const startX = findFreeSlotX(cursor, cursor.offsetX, startY);
  const cell: DisplayCell = {
    lenX,
    lenY,
    x: startX,
    y: startY,
    tnode,
    constraints: UNMEASURED_CONSTRAINTS
  };
  grid.cells.push(cell);
  cursor.offsetX = startX + lenX;
  if (lenY > 1) {
    // A spanning cell claims the whole rectangle it covers, so a cell that is
    // both `colspan` and `rowspan` blocks every column it straddles in each of
    // the rows below — not just its first one.
    for (let y = startY + 1; y < lenY + startY; y++) {
      for (let x = startX; x < startX + lenX; x++) {
        cursor.occupied.add(`${x},${y}`);
      }
    }
  }
  grid.maxX = Math.max(grid.maxX, startX + lenX - 1);
}

/**
 * Lay every `th` and `td` of a table out on its matrix.
 *
 * @returns Where each cell sits and how far the matrix extends. Cell
 * constraints are left {@link UNMEASURED_CONSTRAINTS} — measuring them needs
 * the resolved cell styles and the table's content width, neither of which
 * exists yet.
 */
export default function buildTableGrid(tnode: TNode): TableGrid {
  const grid: TableGrid = { cells: [], maxX: -1, maxY: -1 };
  fill(tnode, grid, { offsetX: 0, occupied: new Set() });
  return grid;
}
