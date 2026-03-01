import {
  TableCell,
  Display,
  DisplayCell,
  TableFlexColumnContainer,
  TableFlexRowContainer,
  TableRoot
} from '../shared-types';
import makeRows from './makeRows';

function getRowGroupHeight(cells: TableCell[]): number {
  return cells.reduce((maxLen, cell) => Math.max(maxLen, cell.lenY), 0);
}

function groupCellsByVGroup(cellsByRow: TableCell[][]): TableCell[][][] {
  const cellsByVGroup: TableCell[][][] = [];
  let rowHeight = 1;
  for (let i = 0; i < cellsByRow.length; i += Math.max(rowHeight, 1)) {
    const row = cellsByRow[i];
    rowHeight = getRowGroupHeight(row);
    cellsByVGroup.push(cellsByRow.slice(i, i + rowHeight));
  }
  return cellsByVGroup;
}

function makeRowContainer(cells: TableCell[]): TableFlexRowContainer {
  return {
    type: 'row-container',
    children: cells
  };
}

function makeColContainer(cells: TableCell[]): TableFlexColumnContainer {
  return {
    type: 'col-container',
    children: makeRows(cells).map(makeRowContainer)
  };
}

function splitToColumnContainers(
  cellsByRow: TableCell[][]
): TableFlexColumnContainer[] {
  const cells: TableCell[] = ([] as TableCell[]).concat(...cellsByRow);
  const breakpointsX: number[] = cells
    .filter((cell) => cell.lenY > 1)
    .map((cell) => cell.x);
  let breakpointIndex = 0;
  const cellsByColumn = [...cells].sort((a, b) => a.x - b.x);
  const containers: TableCell[][] = [];
  let colGroup: TableCell[] = [];
  for (const cell of cellsByColumn) {
    if (cell.x < (breakpointsX[breakpointIndex] ?? Infinity)) {
      colGroup.push(cell);
    } else {
      if (colGroup.length) {
        containers.push(colGroup);
      }
      containers.push([cell]);
      colGroup = [];
      breakpointIndex += 1;
    }
  }
  if (colGroup.length) {
    containers.push(colGroup);
  }
  return containers.map(makeColContainer);
}

function translateVGroups(
  virtualRowGroups: TableCell[][][]
): TableFlexRowContainer[] {
  const flattenRows: TableFlexRowContainer[] = [];
  for (const rowGroup of virtualRowGroups) {
    if (rowGroup.length === 1) {
      flattenRows.push({
        type: 'row-container',
        children: rowGroup[0]
      });
    } else {
      const container: TableFlexRowContainer = {
        type: 'row-container',
        children: splitToColumnContainers(rowGroup)
      };
      flattenRows.push(container);
    }
  }
  return flattenRows;
}

function makeCell(columnWidths: number[], cell: DisplayCell): TableCell {
  let width = 0;
  for (let i = cell.x; i < cell.x + cell.lenX; i++) {
    width += columnWidths[i] ?? 0;
  }
  return {
    ...cell,
    type: 'cell',
    width
  };
}

export default function createRenderTree(
  display: Display,
  columnWidths: number[]
): TableRoot {
  const cells = display.cells.map((cell) => makeCell(columnWidths, cell));
  const rows = makeRows(cells);
  const vGroups = groupCellsByVGroup(rows);
  const children = translateVGroups(vGroups);
  return {
    type: 'root',
    children
  };
}
