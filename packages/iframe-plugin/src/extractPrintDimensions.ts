export interface ExtractPrintDimensionsParams {
  attrWidth: number | null;
  attrHeight: number | null;
  styleWidth: number | null;
  styleHeight: number | null;
  contentWidth: number;
}

export default function extractPrintDimensions({
  attrWidth,
  attrHeight,
  styleWidth,
  styleHeight,
  contentWidth
}: ExtractPrintDimensionsParams) {
  let printWidth: number, printHeight: number;
  let ratio: number;
  if (typeof attrWidth === 'number' && typeof attrHeight === 'number') {
    ratio = attrWidth / attrHeight;
  } else if (
    typeof styleWidth === 'number' &&
    typeof styleHeight === 'number'
  ) {
    ratio = styleWidth / styleHeight;
  } else {
    ratio = 16 / 9;
  }
  printWidth = Math.min(
    contentWidth,
    typeof attrWidth === 'number'
      ? attrWidth
      : typeof styleWidth === 'number'
      ? styleWidth
      : contentWidth
  );
  printHeight = printWidth / ratio;
  return {
    printWidth,
    printHeight
  };
}
