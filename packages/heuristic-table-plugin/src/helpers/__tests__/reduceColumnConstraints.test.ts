import reduceColumnConstraints from '../reduceColumnConstraints';

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
    ).toEqual([{ minWidth: 51, spread: 51, contentDensity: 10 }]);
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
      {
        contentDensity: 6,
        spread: 3,
        minWidth: 2
      },
      {
        contentDensity: 6,
        spread: 4,
        minWidth: 3
      }
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
      {
        contentDensity: 7,
        spread: 4,
        minWidth: 2
      },
      {
        contentDensity: 3,
        spread: 3,
        minWidth: 1
      },
      {
        contentDensity: 3,
        spread: 3,
        minWidth: 1
      }
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
      { contentDensity: 3, spread: 3, minWidth: 2 },
      { contentDensity: 0, spread: 0, minWidth: 0 },
      { contentDensity: 5, spread: 5, minWidth: 4 }
    ]);
  });
});
