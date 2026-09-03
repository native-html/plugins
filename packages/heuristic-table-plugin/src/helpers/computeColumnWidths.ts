import { Display, TColumnConstraints } from '../shared-types';
import reduceColumnConstraints from './reduceColumnConstraints';
import type { DeclaredColumnWidth } from './extractColumnWidths';

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

function interpolateWidths(
  lower: number[],
  upper: number[],
  targetWidth: number
): number[] {
  const lowerTotal = sumOf(lower);
  const upperTotal = sumOf(upper);
  if (upperTotal <= lowerTotal) {
    return lower;
  }
  const progress = Math.max(
    0,
    Math.min(1, (targetWidth - lowerTotal) / (upperTotal - lowerTotal))
  );
  return lower.map(
    (width, i) => width + ((upper[i] ?? width) - width) * progress
  );
}

/** CSS tables cap accumulated intrinsic column percentages at 100%. */
function normalizePercentages(
  declaredWidths: Array<DeclaredColumnWidth | null>,
  columnCount: number
): Array<number | null> {
  const percentages: Array<number | null> = [];
  let remaining = 1;
  for (let i = 0; i < columnCount; i++) {
    const percent = declaredWidths[i]?.percent;
    if (percent == null || percent <= 0) {
      percentages[i] = null;
    } else {
      percentages[i] = Math.min(percent, remaining);
      remaining = Math.max(0, remaining - percent);
    }
  }
  return percentages;
}

function addDistributedWidth(
  widths: number[],
  total: number,
  indexes: number[]
): number[] {
  if (indexes.length === 0 || total <= 0) {
    return widths;
  }
  const weights = indexes.map((i) => widths[i] ?? 0);
  const shares = distribute(total, weights);
  return widths.map((width, i) => {
    const candidateIndex = indexes.indexOf(i);
    return candidateIndex === -1
      ? width
      : width + (shares[candidateIndex] ?? 0);
  });
}

export default function computeColumnWidths(
  display: Display,
  declaredWidths: Array<DeclaredColumnWidth | null> = []
): number[] {
  const contentWidth = display.contentWidth;
  const shouldStretch = !!display.forceStretch;
  const columnConstraints = reduceColumnConstraints(display.cells);
  const columnCount = Math.max(columnConstraints.length, declaredWidths.length);
  for (let i = 0; i < columnCount; i++) {
    const constraints = (columnConstraints[i] ??= {
      minWidth: 0,
      spread: 0,
      contentDensity: 0
    });
    const declaredWidth = declaredWidths[i]?.minWidth;
    if (declaredWidth != null && declaredWidth > 0) {
      // Absolute column widths contribute to intrinsic minimum and preferred
      // widths. Percentage widths remain unresolved until distribution below.
      constraints.minWidth = Math.max(constraints.minWidth, declaredWidth);
      constraints.spread = Math.max(constraints.spread, declaredWidth);
    }
  }
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

  // Keep percentage columns as a separate sizing class. This is the critical
  // difference from resolving percentages to hard pixel minima up front: when
  // the full percentage guess does not fit, browsers interpolate back toward
  // the min-content guess while keeping the total at the assignable width.
  const percentages = normalizePercentages(
    declaredWidths,
    columnConstraints.length
  );
  const percentageGuess = minWidths.map((minWidth, i) => {
    const percent = percentages[i];
    return percent === null || percent === undefined
      ? minWidth
      : Math.max(minWidth, percent * contentWidth);
  });
  const percentageGuessTotal = sumOf(percentageGuess);
  if (contentWidth <= percentageGuessTotal) {
    return interpolateWidths(minWidths, percentageGuess, contentWidth);
  }

  // Next move non-percentage columns from min-content toward max-content. A
  // percentage column keeps the width assigned by the percentage sizing guess.
  const maxContentGuess = percentageGuess.map((width, i) =>
    percentages[i] == null ? Math.max(width, spreads[i] ?? 0) : width
  );
  const maxContentGuessTotal = sumOf(maxContentGuess);
  if (contentWidth <= maxContentGuessTotal) {
    return interpolateWidths(percentageGuess, maxContentGuess, contentWidth);
  }

  // An auto-width table can shrink to its max-content size. An explicitly
  // sized table (or forceStretch) must distribute the remaining assignable
  // width so that the columns add up to the table width.
  if (!shouldStretch) {
    return maxContentGuess;
  }
  const leftover = contentWidth - maxContentGuessTotal;
  const autoColumns = maxContentGuess
    .map((_, i) => i)
    .filter((i) => declaredWidths[i] == null);
  if (autoColumns.length > 0) {
    return addDistributedWidth(maxContentGuess, leftover, autoColumns);
  }
  const percentColumns = percentages
    .map((percent, i) => (percent == null ? -1 : i))
    .filter((i) => i >= 0);
  return addDistributedWidth(
    maxContentGuess,
    leftover,
    percentColumns.length > 0
      ? percentColumns
      : maxContentGuess.map((_, i) => i)
  );
}
