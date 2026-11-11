import { TableCell } from '../shared-types';

/**
 * Group cells into rows, ordered top to bottom.
 *
 * @remarks
 * The sort is explicit rather than left to key iteration order: grouping into
 * a plain object happens to come back in ascending row order only because `y`
 * stringifies to an array index, which is a property of the keys rather than
 * anything this function states.
 */
export default function makeRows(cells: readonly TableCell[]): TableCell[][] {
  const grouped = new Map<number, TableCell[]>();
  for (const cell of cells) {
    const row = grouped.get(cell.y);
    if (row) {
      row.push(cell);
    } else {
      grouped.set(cell.y, [cell]);
    }
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) => row);
}
