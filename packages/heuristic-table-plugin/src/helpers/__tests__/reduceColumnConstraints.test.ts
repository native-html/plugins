import reduceColumnConstraints from '../reduceColumnConstraints';

describe('getColumnConstraints', () => {
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
});
