import {
  TableCell,
  Display,
  DisplayCell,
  FlexColumnContainer,
  FlexRowContainer,
  Root
} from '../shared-types';
import pipe from 'ramda/src/pipe';
import prop from 'ramda/src/prop';
import slice from 'ramda/src/slice';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import max from 'ramda/src/max';
import reduce from 'ramda/src/reduce';
import partial from 'ramda/src/partial';
import flatten from 'ramda/src/flatten';
import sort from 'ramda/src/sort';
import filter from 'ramda/src/filter';
import makeRows from './makeRows';

const getRowGroupHeight = pipe(
  map<TableCell, number>(prop('lenY')),
  reduce<number, number>(max, 0)
);

function groupCellsByVGroup(cellsByRow: TableCell[][]) {
  const cellsByVGroup: TableCell[][][] = [];
  let rowHeight = 1;
  for (let i = 0; i < cellsByRow.length; i += Math.max(rowHeight, 1)) {
    const row = cellsByRow[i];
    rowHeight = getRowGroupHeight(row);
    cellsByVGroup.push(slice(i, i + rowHeight)(cellsByRow));
  }
  return cellsByVGroup;
}

function makeRowContainer(cells: TableCell[]): FlexRowContainer {
  return {
    type: 'row-container',
    children: cells
  };
}

function makeColContainer(cells: TableCell[]): FlexColumnContainer {
  return {
    type: 'col-container',
    children: makeRows(cells).map(makeRowContainer)
  };
}

const splitToColumnContainers = pipe<
  TableCell[][],
  TableCell[],
  FlexColumnContainer[]
>(flatten, function (cells: TableCell[]): FlexColumnContainer[] {
  let breakpointsX: number[] = pipe<TableCell[], TableCell[], number[]>(
    filter((cell: TableCell) => cell.lenY > 1),
    map(prop('x'))
  )(cells);
  let breakpointIndex = 0;
  const cellsByRow = sort((a: TableCell, b: TableCell) => a.x - b.x)(cells);
  let containers: TableCell[][] = [];
  let colGroup: TableCell[] = [];
  for (const cell of cellsByRow) {
    if (cell.x < (breakpointsX[breakpointIndex] ?? Infinity)) {
      colGroup.push(cell);
    } else {
      colGroup.length && containers.push(colGroup);
      containers.push([cell]);
      colGroup = [];
      breakpointIndex += 1;
    }
  }
  colGroup.length && containers.push(colGroup);
  return containers.map(makeColContainer);
});

function translateVGroups(
  virtualRowGroups: TableCell[][][]
): FlexRowContainer[] {
  const flattenRows: FlexRowContainer[] = [];
  for (const rowGroup of virtualRowGroups) {
    if (rowGroup.length === 1) {
      flattenRows.push({
        type: 'row-container',
        children: rowGroup[0]
      });
    } else {
      const container: FlexRowContainer = {
        type: 'row-container',
        children: splitToColumnContainers(rowGroup)
      };
      flattenRows.push(container);
    }
  }
  return flattenRows;
}

function makeCell(columnWidths: number[], cell: DisplayCell): TableCell {
  return {
    ...cell,
    type: 'cell',
    width: pipe(slice(cell.x, cell.x + cell.lenX), sum)(columnWidths)
  };
}

export default function createRenderTree(
  display: Display,
  columnWidths: number[]
): Root {
  const children = pipe(
    map(partial(makeCell, [columnWidths])),
    makeRows,
    groupCellsByVGroup,
    translateVGroups
  )(display.cells);
  return {
    type: 'root',
    children: children
  };
}
