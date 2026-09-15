import reduceColumnConstraints from '../reduceColumnConstraints';
import { TColumnConstraints } from '../../shared-types';

/** A column reduced from cells that declare no spacing and no percentage. */
function bare(
  constraints: Omit<TColumnConstraints, 'horizontalSpace' | 'percentWidth'>
): TColumnConstraints {
  return { horizontalSpace: 0, percentWidth: null, ...constraints };
}

describe('reduceColumnConstraints', () => {
  it('should raise a maximum below its minimum to the minimum', () => {
    expect(
      reduceColumnConstraints([
        {
          x: 0,
          y: 0,
          lenX: 1,
          lenY: 1,
          constraints: { minWidth: 51, maxWidth: 30, contentDensity: 10 }
        }
      ])
    ).toEqual([bare({ minWidth: 51, spread: 51, contentDensity: 10 })]);
  });

  it('should return a record which keys are column indexes, and which values are the reduced constraints for this column', () => {
    expect(
      reduceColumnConstraints([
        {
          lenX: 1,
          lenY: 1,
          x: 0,
          y: 0,
          constraints: {
            contentDensity: 3,
            maxWidth: 3,
            minWidth: 2
          }
        },
        {
          lenX: 1,
          lenY: 1,
          x: 1,
          y: 0,
          constraints: {
            contentDensity: 4,
            maxWidth: 4,
            minWidth: 3
          }
        },
        {
          lenX: 1,
          lenY: 1,
          x: 0,
          y: 1,
          constraints: {
            contentDensity: 3,
            maxWidth: 3,
            minWidth: 1
          }
        },
        {
          lenX: 1,
          lenY: 1,
          x: 1,
          y: 1,
          constraints: {
            contentDensity: 2,
            maxWidth: 2,
            minWidth: 1
          }
        }
      ])
    ).toEqual([
      bare({ contentDensity: 6, spread: 3, minWidth: 2 }),
      bare({ contentDensity: 6, spread: 4, minWidth: 3 })
    ]);
  });
  it('should split content density and min width of cells expanding horizontaly by its length when reducing constraints', () => {
    expect(
      reduceColumnConstraints([
        {
          lenX: 3,
          lenY: 1,
          x: 0,
          y: 0,
          constraints: {
            contentDensity: 9,
            maxWidth: 9,
            minWidth: 3
          }
        },
        {
          lenX: 1,
          lenY: 1,
          x: 0,
          y: 1,
          constraints: {
            contentDensity: 4,
            maxWidth: 4,
            minWidth: 2
          }
        }
      ])
    ).toEqual([
      bare({ contentDensity: 7, spread: 4, minWidth: 2 }),
      bare({ contentDensity: 3, spread: 3, minWidth: 1 }),
      bare({ contentDensity: 3, spread: 3, minWidth: 1 })
    ]);
  });
  it('should keep a slot for a column no cell occupies', () => {
    // Callers look constraints up by a cell's absolute `x`, so an unoccupied
    // column has to keep its place: compacting it away would hand every later
    // column the width of its neighbour.
    expect(
      reduceColumnConstraints([
        {
          lenX: 1,
          lenY: 1,
          x: 0,
          y: 0,
          constraints: { contentDensity: 3, maxWidth: 3, minWidth: 2 }
        },
        {
          lenX: 1,
          lenY: 1,
          x: 2,
          y: 0,
          constraints: { contentDensity: 5, maxWidth: 5, minWidth: 4 }
        }
      ])
    ).toEqual([
      bare({ contentDensity: 3, spread: 3, minWidth: 2 }),
      bare({ contentDensity: 0, spread: 0, minWidth: 0 }),
      bare({ contentDensity: 5, spread: 5, minWidth: 4 })
    ]);
  });

  it('spreads a colspan cell spacing and percentage over its columns', () => {
    expect(
      reduceColumnConstraints([
        {
          lenX: 2,
          lenY: 1,
          x: 0,
          y: 0,
          constraints: {
            contentDensity: 8,
            maxWidth: 8,
            minWidth: 4,
            horizontalSpace: 6,
            percentWidth: 0.5
          }
        }
      ])
    ).toEqual([
      {
        contentDensity: 4,
        spread: 4,
        minWidth: 2,
        horizontalSpace: 3,
        percentWidth: 0.25
      },
      {
        contentDensity: 4,
        spread: 4,
        minWidth: 2,
        horizontalSpace: 3,
        percentWidth: 0.25
      }
    ]);
  });

  it('takes the widest spacing and largest percentage where cells disagree', () => {
    const cell = (y: number, horizontalSpace: number, percentWidth: number) => ({
      lenX: 1,
      lenY: 1,
      x: 0,
      y,
      constraints: {
        contentDensity: 1,
        maxWidth: 1,
        minWidth: 1,
        horizontalSpace,
        percentWidth
      }
    });
    expect(reduceColumnConstraints([cell(0, 2, 0.1), cell(1, 9, 0.4)])).toEqual([
      {
        contentDensity: 2,
        spread: 1,
        minWidth: 1,
        horizontalSpace: 9,
        percentWidth: 0.4
      }
    ]);
  });
});
