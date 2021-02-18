import getColumnWeights from '../getColumnWeights';

describe('getColumnWeights', () => {
  it('should return a record which keys are column indexes, and which values are the maximum weight for this column', () => {
    expect(
      getColumnWeights([
        {
          lenX: 1,
          lenY: 1,
          x: 0,
          y: 0,
          weight: 1
        },
        {
          lenX: 1,
          lenY: 1,
          x: 1,
          y: 0,
          weight: 2
        },
        {
          lenX: 1,
          lenY: 1,
          x: 0,
          y: 1,
          weight: 3
        },
        {
          lenX: 1,
          lenY: 1,
          x: 1,
          y: 1,
          weight: 4
        }
      ])
    ).toEqual([3, 4]);
  });
  it('should split weight of cells expanding horizontaly by its length when computing max weight', () => {
    expect(
      getColumnWeights([
        {
          lenX: 3,
          lenY: 1,
          x: 0,
          y: 0,
          weight: 9
        },
        {
          lenX: 1,
          lenY: 1,
          x: 0,
          y: 1,
          weight: 4
        }
      ])
    ).toEqual([4, 3, 3]);
  });
});
