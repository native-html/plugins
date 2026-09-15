import { clampWidth } from './resolveWidth';
import {
  CellProperties,
  TCellConstraints,
  TColumnConstraints
} from '../shared-types';

const EMPTY_COLUMN: TColumnConstraints = {
  minWidth: 0,
  spread: 0,
  contentDensity: 0,
  horizontalSpace: 0,
  percentWidth: null
};

function largest(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}

function getColumnMetrics(cells: CellProperties[]): TColumnConstraints {
  const column = cells
    .map((c) => c.constraints)
    .reduce(
      (
        columnConstraints: TColumnConstraints,
        cellConstraints: TCellConstraints
      ) => ({
        minWidth: Math.max(
          columnConstraints.minWidth,
          cellConstraints.minWidth
        ),
        contentDensity:
          columnConstraints.contentDensity + cellConstraints.contentDensity,
        spread: Math.max(columnConstraints.spread, cellConstraints.maxWidth),
        horizontalSpace: Math.max(
          columnConstraints.horizontalSpace,
          cellConstraints.horizontalSpace ?? 0
        ),
        percentWidth: largest(
          columnConstraints.percentWidth,
          cellConstraints.percentWidth ?? null
        )
      }),
      EMPTY_COLUMN
    );
  // CSS 2.1 §17.5.2.2 derives the column minimum and maximum from the same
  // cells, each floored by the column 'width' — so a maximum below its own
  // minimum is not a state the spec can produce. Restate it here so callers
  // may clamp against `spread` without starving the column.
  return {
    ...column,
    spread: clampWidth(column.spread, column.minWidth, null)
  };
}

/**
 * Share a spanning cell's figures across the columns it covers.
 *
 * @remarks
 * Every per-cell quantity a column is reduced from is divided the same way, so
 * that a `colspan` cannot contribute its whole width, spacing or percentage to
 * each of its columns in turn. Keeping them together is the point: they were
 * once spread in three places, and two of them had already drifted apart on
 * whether a span overrunning the grid is clamped to it.
 */
function splitColspanCells(
  cell: CellProperties
): CellProperties | CellProperties[] {
  if (cell.lenX === 1) {
    return cell;
  }
  const share = <T extends number | null | undefined>(value: T) =>
    value == null ? null : (value as number) / cell.lenX;
  const cells: CellProperties[] = [];
  for (let i = 0; i < cell.lenX; i++) {
    cells[i] = {
      lenX: 1,
      lenY: cell.lenY,
      constraints: {
        minWidth: cell.constraints.minWidth / cell.lenX,
        maxWidth: cell.constraints.maxWidth / cell.lenX,
        contentDensity: cell.constraints.contentDensity / cell.lenX,
        horizontalSpace: (cell.constraints.horizontalSpace ?? 0) / cell.lenX,
        ...(share(cell.constraints.percentWidth) === null
          ? null
          : { percentWidth: share(cell.constraints.percentWidth)! })
      },
      x: cell.x + i,
      y: cell.y
    };
  }
  return cells;
}

export default function reduceColumnConstraints(
  cells: CellProperties[]
): TColumnConstraints[] {
  const flatCells = cells.flatMap(splitColspanCells);
  if (flatCells.length === 0) {
    return [];
  }
  const grouped: CellProperties[][] = [];
  let lastColumn = 0;
  for (const cell of flatCells) {
    // Callers index the result by a cell's absolute `x`, so the array has to
    // stay dense: a column that no cell occupies must still hold a slot, or
    // every column after it would be handed the width of its neighbour.
    (grouped[cell.x] ??= []).push(cell);
    lastColumn = Math.max(lastColumn, cell.x);
  }
  const columns: TColumnConstraints[] = [];
  for (let x = 0; x <= lastColumn; x++) {
    columns[x] = getColumnMetrics(grouped[x] ?? []);
  }
  return columns;
}
