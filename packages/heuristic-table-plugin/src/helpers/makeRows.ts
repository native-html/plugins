import { TableCell } from '../shared-types';

export default function makeRows(cells: readonly TableCell[]): TableCell[][] {
  const grouped: Record<string, TableCell[]> = {};
  for (const cell of cells) {
    const key = String(cell.y);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(cell);
  }
  return Object.values(grouped);
}
