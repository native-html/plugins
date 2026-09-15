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

  it('groups cells by row, in ascending row order', () => {
    // Deliberately out of order, and with several cells per row: the previous
    // implementation happened to come back sorted because `y` stringifies to
    // an array index, which is a property of the keys rather than something
    // this function stated.
    const rows = makeRows([
      cell(2, 0),
      cell(0, 0),
      cell(1, 0),
      cell(0, 1),
      cell(2, 1)
    ]);
    expect(rows.map((row) => row.map((c) => [c.x, c.y]))).toEqual([
      [
        [0, 0],
        [1, 0]
      ],
      [[0, 1]],
      [
        [0, 2],
        [1, 2]
      ]
    ]);
  });

  it('keeps cells of one row in the order they were given', () => {
    const rows = makeRows([cell(0, 2), cell(0, 0), cell(0, 1)]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.map((c) => c.x)).toEqual([2, 0, 1]);
  });
});
