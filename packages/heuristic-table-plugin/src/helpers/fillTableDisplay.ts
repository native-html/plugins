import { TNode } from 'react-native-render-html';
import { Display, DisplayCell, Settings } from '../shared-types';
import TCellConstraintsComputer from './TCellConstraintsComputer';

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

function computeOffsetX(display: Display, startX: number, startY: number) {
  return display.occupiedCoordinates.reduce((prev, coordinates) => {
    if (coordinates.x <= startX && coordinates.y === startY) {
      return prev + 1;
    }
    return prev;
  }, 0);
}

export default function fillTableDisplay(
  tnode: TNode,
  display: Display,
  computer: TCellConstraintsComputer
) {
  if (tnode.tagName === 'tr') {
    display.maxY = display.maxY + 1;
    display.offsetX = 0;
  }
  if (tnode.tagName === 'th' || tnode.tagName === 'td') {
    const rowspan = Number(tnode.attributes.rowspan);
    const colspan = Number(tnode.attributes.colspan);
    const lenX = Number.isFinite(colspan) ? colspan : 1;
    const lenY = Number.isFinite(rowspan) ? rowspan : 1;
    const initialStartX = display.offsetX + tnode.nodeIndex;
    const startY = display.maxY;
    const startX =
      computeOffsetX(display, initialStartX, display.maxY) + initialStartX;
    const constraints = computer.computeCellConstraints(tnode);
    const cell: DisplayCell = {
      lenX,
      lenY,
      x: startX,
      y: startY,
      tnode,
      constraints
    };
    display.cells.push(cell);
    display.offsetX += lenX - 1;
    if (lenY > 1) {
      for (let y = startY + 1; y < lenY + startY; y++) {
        display.occupiedCoordinates.push({ x: startX, y });
      }
    }
    display.maxX = Math.max(display.maxX, initialStartX);
  } else {
    tnode.children.forEach((child) =>
      fillTableDisplay(child, display, computer)
    );
  }
}
