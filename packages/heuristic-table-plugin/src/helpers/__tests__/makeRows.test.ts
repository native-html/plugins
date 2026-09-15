import { TNode } from '@native-html/render';
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
      minWidth: 0,
      maxWidth: 0
    },
    width: 10,
    x,
    y
  };
}

describe('makeRows', () => {
  it('should preserve order of rows', () => {
    const cells = Array.from({ length: 100 }, (_, y) => cell(y));
    expect(makeRows(cells).flat()).toMatchObject(cells);
  });
});
