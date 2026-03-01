import flatten from 'ramda/src/flatten';

import {
  CellProperties,
  TCellConstraints,
  TColumnConstraints
} from '../shared-types';

function getColumnMetrics(cells: CellProperties[]): TColumnConstraints {
  return cells
    .map((c) => c.constraints)
    .reduce(
      (columnConstraints: TColumnConstraints, cellConstraints: TCellConstraints) => ({
        minWidth: Math.max(
          columnConstraints.minWidth,
          cellConstraints.minWidth
        ),
        contentDensity:
          columnConstraints.contentDensity + cellConstraints.contentDensity,
        spread: Math.max(
          columnConstraints.spread,
          cellConstraints.contentDensity
        )
      }),
      { minWidth: 0, spread: 0, contentDensity: 0 }
    );
}

function splitColspanCells(cell: CellProperties): CellProperties | CellProperties[] {
  if (cell.lenX > 1) {
    const cells: CellProperties[] = [];
    for (let i = 0; i < cell.lenX; i++) {
      cells[i] = {
        lenX: 1,
        lenY: cell.lenY,
        constraints: {
          minWidth: cell.constraints.minWidth / cell.lenX,
          contentDensity: cell.constraints.contentDensity / cell.lenX
        },
        x: cell.x + i,
        y: cell.y
      };
    }
    return cells;
  }
  return cell;
}

export default function reduceColumnConstraints(
  cells: CellProperties[]
): TColumnConstraints[] {
  const flatCells = flatten(cells.map(splitColspanCells)) as CellProperties[];
  const grouped: Record<string, CellProperties[]> = {};
  for (const cell of flatCells) {
    const key = String(cell.x);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(cell);
  }
  return Object.values(grouped).map(getColumnMetrics);
}
