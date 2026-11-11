import { DisplayCell } from '../../shared-types';
import indexCellNeighbours, { CellNeighbours } from '../indexCellNeighbours';
import { createCellTNode } from '../../__tests__/utils';

/**
 * The adjacency rule stated directly, as the oracle the index is checked
 * against.
 *
 * @remarks
 * This used to live in `getCollapsedCellBorderStyle` as the fallback taken
 * when no index was supplied, and the test compared the two code paths. Every
 * collapsing caller now supplies an index, so the rule survives here alone —
 * still an independent implementation, just no longer one that also ships.
 */
function neighboursByScan(
  cells: readonly DisplayCell[],
  cell: DisplayCell
): CellNeighbours {
  return {
    End: cells.filter(
      (other) =>
        other.x === cell.x + cell.lenX &&
        other.y < cell.y + cell.lenY &&
        other.y + other.lenY > cell.y
    ),
    Bottom: cells.filter(
      (other) =>
        other.y === cell.y + cell.lenY &&
        other.x < cell.x + cell.lenX &&
        other.x + other.lenX > cell.x
    )
  };
}

it('matches shared-edge searches for spans, holes, overlaps and document-order ties', () => {
  const tnode = createCellTNode('<table><tr><td>A</td></tr></table>');
  // Deliberately unsorted and overlapping geometry exercises the behaviour for
  // malformed tables as well as ordinary one-slot cells.
  const cells: DisplayCell[] = Array.from({ length: 200 }, (_, i) => ({
    x: (i * 7) % 19,
    y: (i * 11) % 23,
    lenX: 1 + (i % 4),
    lenY: 1 + (i % 5),
    tnode,
    constraints: { minWidth: 0, maxWidth: 0, contentDensity: 0 }
  }));
  const index = indexCellNeighbours(cells);
  for (const cell of cells) {
    expect(index.get(cell)).toEqual(neighboursByScan(cells, cell));
  }
});
