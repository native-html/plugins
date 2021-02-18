import { TNode } from 'react-native-render-html';
import { Display } from '../shared-types';
import computeTNodeWeight from './computeTNodeWeight';

export function createEmptyDisplay(): Display {
  return {
    offsetX: 0,
    occupiedCoordinates: [],
    maxY: 0,
    maxX: 0,
    cells: []
  };
}

function computeOffsetX(display: Display, startX: number, startY: number) {
  return display.occupiedCoordinates.reduce((prev, coordinates) => {
    if (coordinates.x <= startX && coordinates.y === startY) {
      return prev + 1;
    }
    return 0;
  }, 0);
}

export default function fillTableDisplay(tnode: TNode, display: Display) {
  if (tnode.tagName === 'tr') {
    display.maxY = tnode.nodeIndex;
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
    const weight = computeTNodeWeight(tnode);
    const cell = {
      lenX,
      lenY,
      x: startX,
      y: startY,
      tnode,
      weight
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
    tnode.children.forEach((child) => fillTableDisplay(child, display));
  }
}
