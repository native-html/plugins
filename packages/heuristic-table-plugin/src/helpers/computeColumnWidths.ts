import pipe from 'ramda/src/pipe';
import map from 'ramda/src/map';
import max from 'ramda/src/max';
import clamp from 'ramda/src/clamp';
import multiply from 'ramda/src/multiply';
import sum from 'ramda/src/sum';

import { Display } from '../shared-types';
import getColumnWeights from './getColumnWeights';

const minWidth = pipe(multiply(5), max<number>(50));
const prefWidth = pipe(multiply(8), clamp<number>(50, 150));
const totalMinWidths = pipe(map<number, number>(minWidth), sum);

// TODO: attempt const fn with https://ramdajs.com/docs/#useWith
function getResponsiveWidths(
  sumOfWeights: number,
  availableWidth: number,
  weights: number[]
) {
  return map((weight: number) => (weight / sumOfWeights) * availableWidth)(
    weights
  );
}

export default function computeColumnWidths(
  display: Display,
  availableWidth: number
): number[] {
  const columnWeights = getColumnWeights(display.cells);
  const sumOfWeights = sum(columnWeights);
  const sumOfMinWidths = totalMinWidths(columnWeights);
  const responsiveWidths = getResponsiveWidths(
    sumOfWeights,
    availableWidth,
    columnWeights
  );
  const sumOfResponsiveWidths = sum(responsiveWidths);
  if (sumOfResponsiveWidths < sumOfMinWidths) {
    return map(prefWidth, columnWeights);
  }
  return responsiveWidths;
}
