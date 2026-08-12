import { Display, TColumnConstraints } from '../shared-types';
import reduceColumnConstraints from './reduceColumnConstraints';

function mapMinWidths(constraints: TColumnConstraints[]): number[] {
  return constraints.map((c) => c.minWidth);
}

function mapSpreads(constraints: TColumnConstraints[]): number[] {
  return constraints.map((c) => c.spread);
}

function sumOf(values: number[]): number {
  return values.reduce((acc, x) => acc + x, 0);
}

/**
 * Share `total` across `weights`, proportionally. Falls back to an even share
 * when every weight is zero, so that no space is ever silently dropped.
 */
function distribute(total: number, weights: number[]): number[] {
  if (weights.length === 0) {
    return [];
  }
  const totalWeight = sumOf(weights);
  if (totalWeight === 0) {
    return weights.map(() => total / weights.length);
  }
  return weights.map((weight) => (total * weight) / totalWeight);
}

export default function computeColumnWidths(display: Display): number[] {
  const contentWidth = display.contentWidth;
  const shouldStretch = !!display.forceStretch;
  const columnConstraints = reduceColumnConstraints(display.cells);
  if (columnConstraints.length === 0) {
    return [];
  }
  const minWidths = mapMinWidths(columnConstraints);
  const spreads = mapSpreads(columnConstraints);
  const sumOfMinWidths = sumOf(minWidths);
  if (contentWidth < sumOfMinWidths) {
    // The table cannot fit: no column may go below the width it needs to hold
    // its longest word, so the table overflows and `HTMLTable` scrolls it.
    return minWidths;
  }
  const widthToAssign = contentWidth - sumOfMinWidths;
  // Each column may usefully grow from its minimum up to its maximum, and no
  // further. CSS 2.1 §17.5.2.2 shares the surplus over that headroom, so every
  // column that can still benefit gets a proportional share — including the
  // least demanding one, which must not be starved.
  const headrooms = spreads.map((spread, i) =>
    Math.max(0, spread - (minWidths[i] ?? 0))
  );
  const totalHeadroom = sumOf(headrooms);
  if (widthToAssign < totalHeadroom) {
    const shares = distribute(widthToAssign, headrooms);
    return minWidths.map((min, i) => min + (shares[i] ?? 0));
  }
  // Every column can reach its maximum width. Shrink-to-fit leaves the table
  // narrower than its container; `forceStretch` instead spreads the remainder
  // over the columns, in proportion to how much width each one can put to use.
  if (!shouldStretch) {
    return spreads;
  }
  const leftover = widthToAssign - totalHeadroom;
  const shares = distribute(leftover, spreads);
  return spreads.map((spread, i) => spread + (shares[i] ?? 0));
}
