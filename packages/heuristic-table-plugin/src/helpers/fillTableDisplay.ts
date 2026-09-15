import { TNode } from '@native-html/render';
import {
  Display,
  DisplayCell,
  Settings,
  TCellConstraints
} from '../shared-types';
import TCellConstraintsComputer from './TCellConstraintsComputer';

/**
 * The constraints of a cell no computer has measured yet.
 *
 * @remarks
 * {@link fillTableDisplay} may be called without a computer, to lay the grid
 * out before the width its cells must be measured against is known. Every cell
 * of such a display carries this placeholder until the caller's measurement
 * pass replaces it.
 */
const UNMEASURED_CONSTRAINTS: TCellConstraints = Object.freeze({
  contentDensity: 0,
  maxWidth: 0,
  minWidth: 0
});

export function createEmptyDisplay(config: Settings): Display {
  return {
    offsetX: 0,
    occupiedCoordinates: [],
    maxY: -1,
    maxX: -1,
    cells: [],
    ...config
  };
}

const MAX_COLSPAN = 1000;
const MAX_ROWSPAN = 65534;

/**
 * Parse a `colspan` / `rowspan` attribute the way HTML requires.
 *
 * @remarks
 * The attribute is a non-negative integer, clamped to a maximum; anything
 * invalid — a missing value, a negative, a fraction, `0`, or plain nonsense —
 * falls back to `1`. Letting a raw `Number()` through instead lets `0` and
 * negatives corrupt the grid cursor.
 *
 * Note that `rowspan="0"` means "span to the end of the row group" in HTML.
 * Row groups are not modelled here, so it degrades to `1` rather than
 * silently spanning nothing.
 */
function parseSpan(value: unknown, max: number): number {
  const parsed = typeof value === 'string' ? Number(value.trim()) : NaN;
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.min(Math.max(Math.floor(parsed), 1), max);
}

function isOccupied(display: Display, x: number, y: number): boolean {
  return display.occupiedCoordinates.some(
    (coordinates) => coordinates.x === x && coordinates.y === y
  );
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
function findFreeSlotX(display: Display, fromX: number, y: number): number {
  let x = fromX;
  while (isOccupied(display, x, y)) {
    x += 1;
  }
  return x;
}

/**
 * Lay every `th` and `td` of `tnode` out on the matrix of `display`.
 *
 * @param computer - Measures each cell as it is laid down. Omit it to build
 * the grid alone — coordinates and spans do not depend on the width the table
 * resolves to, whereas constraints do, and measuring text is the costly half
 * of a layout pass. Measure the cells once that width is known, as
 * {@link TableLayout} does: the collapsing border model has to resolve the
 * table's own borders — from cell coordinates alone — before the width those
 * cells are measured against exists.
 */
export default function fillTableDisplay(
  tnode: TNode,
  display: Display,
  computer?: TCellConstraintsComputer
) {
  if (tnode.tagName === 'tr') {
    display.maxY = display.maxY + 1;
    display.offsetX = 0;
  }
  if (tnode.tagName === 'th' || tnode.tagName === 'td') {
    const lenX = parseSpan(tnode.attributes.colspan, MAX_COLSPAN);
    const lenY = parseSpan(tnode.attributes.rowspan, MAX_ROWSPAN);
    const startY = display.maxY;
    // `offsetX` is the slot cursor for the current row: cells are laid down
    // left to right from wherever the previous one ended, skipping any slot a
    // spanning cell from an earlier row has already claimed. Deriving the
    // column from `nodeIndex` instead would let a stray non-cell element
    // inside the row shift every following cell.
    const startX = findFreeSlotX(display, display.offsetX, startY);
    const constraints = computer
      ? computer.computeCellConstraints(tnode)
      : UNMEASURED_CONSTRAINTS;
    const cell: DisplayCell = {
      lenX,
      lenY,
      x: startX,
      y: startY,
      tnode,
      constraints
    };
    display.cells.push(cell);
    display.offsetX = startX + lenX;
    if (lenY > 1) {
      // A spanning cell claims the whole rectangle it covers, so a cell that
      // is both `colspan` and `rowspan` blocks every column it straddles in
      // each of the rows below — not just its first one.
      for (let y = startY + 1; y < lenY + startY; y++) {
        for (let x = startX; x < startX + lenX; x++) {
          display.occupiedCoordinates.push({ x, y });
        }
      }
    }
    display.maxX = Math.max(display.maxX, startX + lenX - 1);
  } else {
    tnode.children.forEach((child) =>
      fillTableDisplay(child, display, computer)
    );
  }
}
