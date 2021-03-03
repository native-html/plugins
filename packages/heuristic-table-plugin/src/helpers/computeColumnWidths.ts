import pipe from 'ramda/src/pipe';
import map from 'ramda/src/map';
import prop from 'ramda/src/prop';
import sum from 'ramda/src/sum';
import min from 'ramda/src/min';
import reduce from 'ramda/src/reduce';
import converge from 'ramda/src/converge';
import subtract from 'ramda/src/subtract';
import partialRight from 'ramda/src/partialRight';
import divide from 'ramda/src/divide';
import add from 'ramda/src/add';
import zip from 'ramda/src/zip';
import multiply from 'ramda/src/multiply';
import identity from 'ramda/src/identity';

import { Display, TColumnConstraints } from '../shared-types';
import reduceColumnConstraints from './reduceColumnConstraints';

const mapMinWidths = map<TColumnConstraints, number>(prop('minWidth'));
const mapspreads = map<TColumnConstraints, number>(prop('spread'));

// Compute the normal content density for each column,
// that is content density with the zero reference as
// the shortest column.
const mapNormalContentDensity = converge(
  (m: number, list: number[]) => {
    return map(partialRight(subtract, [m]))(list);
  },
  [reduce(min, Infinity), identity]
);

const weightContentDensity = converge(
  (s: number, list: number[]) => {
    return map(partialRight(divide, [s]))(list);
  },
  [sum, identity]
);

const mapWeightedColumnCoeffs = pipe(
  map<TColumnConstraints, number>(prop('contentDensity')),
  mapNormalContentDensity,
  weightContentDensity
);

const totalMinWidths = pipe(mapMinWidths, sum);

export default function computeColumnWidths(display: Display): number[] {
  const contentWidth = display.contentWidth;
  let shouldClampWidth = !display.forceStretch;
  const columnConstraints = reduceColumnConstraints(display.cells);
  const minWidths = mapMinWidths(columnConstraints);
  const spreads = mapspreads(columnConstraints);
  const sumOfMinWidths = totalMinWidths(columnConstraints);
  if (contentWidth < sumOfMinWidths) {
    return minWidths;
  }
  const widthToAssign = contentWidth - sumOfMinWidths;
  const clampWidths = pipe<any, any, any>(
    zip(spreads),
    map(reduce(min, Infinity))
  );
  const columns = pipe(
    mapWeightedColumnCoeffs,
    map(multiply(widthToAssign)),
    zip(minWidths),
    map(reduce(add, 0)),
    shouldClampWidth ? clampWidths : identity
  )(columnConstraints);
  return columns;
}
