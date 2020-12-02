import extractPrintDimensions from '../extractPrintDimensions';

describe('extractPrintWidth', () => {
  it('should fallback to content width with a 16 / 9 default aspect ratio when no styles are available', () => {
    expect(
      extractPrintDimensions({
        attrHeight: null,
        attrWidth: null,
        styleHeight: null,
        styleWidth: null,
        contentWidth: 300
      })
    ).toEqual({
      printWidth: 300,
      printHeight: (300 / 16) * 9
    });
  });
  it('should pick attributes aspect ratio and scale to the min(contentWidth, physicalWidth)', () => {
    expect(
      extractPrintDimensions({
        attrHeight: 400,
        attrWidth: 300,
        styleHeight: null,
        styleWidth: null,
        contentWidth: 300
      })
    ).toEqual({
      printWidth: 300,
      printHeight: (300 / 3) * 4
    });
  });
});
