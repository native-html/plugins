import { Display, TColumnConstraints } from '../shared-types';
import reduceColumnConstraints from './reduceColumnConstraints';

function mapMinWidths(constraints: TColumnConstraints[]): number[] {
  return constraints.map((c) => c.minWidth);
}

function mapSpreads(constraints: TColumnConstraints[]): number[] {
  return constraints.map((c) => c.spread);
}

// Normalize content densities so the minimum column is zero-referenced,
// then weight them so they sum to 1 (used to distribute extra width).
function mapWeightedColumnCoeffs(
  columnConstraints: TColumnConstraints[]
): number[] {
  const densities = columnConstraints.map((c) => c.contentDensity);
  const minDensity = densities.reduce(
    (acc, x) => Math.min(acc, x),
    Infinity
  );
  const normalized = densities.map((x) => x - minDensity);
  const total = normalized.reduce((acc, x) => acc + x, 0);
  return normalized.map((x) => (total === 0 ? 0 : x / total));
}

export default function computeColumnWidths(display: Display): number[] {
  const contentWidth = display.contentWidth;
  const shouldClampWidth = !display.forceStretch;
  const columnConstraints = reduceColumnConstraints(display.cells);
  const minWidths = mapMinWidths(columnConstraints);
  const spreads = mapSpreads(columnConstraints);
  const sumOfMinWidths = minWidths.reduce((a, b) => a + b, 0);
  if (contentWidth < sumOfMinWidths) {
    return minWidths;
  }
  const widthToAssign = contentWidth - sumOfMinWidths;
  const weightedCoeffs = mapWeightedColumnCoeffs(columnConstraints);
  const rawWidths = minWidths.map(
    (min, i) => min + weightedCoeffs[i]! * widthToAssign
  );
  if (shouldClampWidth) {
    return rawWidths.map((w, i) => Math.min(w, spreads[i] ?? Infinity));
  }
  return rawWidths;
}
