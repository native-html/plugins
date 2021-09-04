import { TNode } from 'react-native-render-html';
import R from 'ramda';
import { TableCell } from '../../shared-types';
import makeRows from '../makeRows';

function cell(y: number, x: number = 0): TableCell {
  return {
    lenX: 1,
    lenY: 1,
    tnode: {} as unknown as TNode,
    type: 'cell',
    constraints: {
      contentDensity: 0,
      minWidth: 0
    },
    width: 10,
    x,
    y
  };
}

describe('makeRows', () => {
  it('should preserve order of rows', () => {
    const cells = R.map(cell, R.range(0, 100));
    expect(R.flatten(makeRows(cells))).toMatchObject(cells);
  });
});
