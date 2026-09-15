import relaxHeightConstraint from '../relaxHeightConstraint';

describe('relaxHeightConstraint', () => {
  it('translates height to minHeight while preserving unrelated styles', () => {
    expect(
      relaxHeightConstraint({ height: 48, backgroundColor: 'red' })
    ).toEqual({
      minHeight: 48,
      backgroundColor: 'red'
    });
  });
  it('should leave styles without an explicit height untouched', () => {
    expect(relaxHeightConstraint({ minHeight: 10, maxHeight: 20 })).toEqual({
      minHeight: 10,
      maxHeight: 20
    });
  });
  it('should retain the greatest of height and minHeight', () => {
    expect(relaxHeightConstraint({ height: 48, minHeight: 10 })).toEqual({
      minHeight: 48
    });
    expect(relaxHeightConstraint({ height: 10, minHeight: 48 })).toEqual({
      minHeight: 48
    });
  });
  it('should favor an explicit minHeight over an incomparable height', () => {
    expect(relaxHeightConstraint({ height: '50%', minHeight: 48 })).toEqual({
      minHeight: 48
    });
  });
  it('should not enforce a percentage height either', () => {
    expect(relaxHeightConstraint({ height: '50%' })).toEqual({
      minHeight: '50%'
    });
  });
});
