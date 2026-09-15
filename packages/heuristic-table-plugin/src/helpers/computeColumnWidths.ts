import { Display, TColumnConstraints } from '../shared-types';
import reduceColumnConstraints from './reduceColumnConstraints';
import type { DeclaredColumnWidth } from './extractColumnWidths';
import { clampWidth, lesserBound } from './resolveWidth';

/** Below this many pixels a leftover is not worth another distribution pass. */
const EPSILON = 1e-6;

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

/**
 * Grow the columns at `indexes` by `total`, never past a column's own
 * `max-width`.
 *
 * @remarks
 * Space a capped column cannot take is offered to the others, and space none
 * of them can take is left unassigned: a table whose every column is capped
 * ends up narrower than the width it was given, as it would in CSS, rather
 * than pushing a column past the ceiling it declared.
 */
function addDistributedWidth(
  widths: number[],
  total: number,
  indexes: number[],
  caps: Array<number | null>
): number[] {
  if (indexes.length === 0 || total <= 0) {
    return widths;
  }
  const result = [...widths];
  const hasRoom = (i: number) => {
    const cap = caps[i];
    return cap == null || (result[i] ?? 0) < cap;
  };
  let candidates = indexes.filter(hasRoom);
  let remaining = total;
  while (remaining > EPSILON && candidates.length > 0) {
    const shares = distribute(
      remaining,
      candidates.map((i) => result[i] ?? 0)
    );
    let consumed = 0;
    candidates.forEach((i, k) => {
      const cap = caps[i];
      const current = result[i] ?? 0;
      const grown = current + (shares[k] ?? 0);
      const used = cap == null ? grown : Math.min(grown, cap);
      result[i] = used;
      consumed += used - current;
    });
    if (consumed <= EPSILON) {
      break;
    }
    remaining -= consumed;
    candidates = candidates.filter(hasRoom);
  }
  return result;
}

export default function computeColumnWidths(
  display: Display,
  declaredWidths: Array<DeclaredColumnWidth | null> = []
): number[] {
  const contentWidth = display.contentWidth;
  const shouldStretch = !!display.forceStretch;
  // The cell grid alone decides how many columns a table has. `col` and
  // `colgroup` declarations past its last column describe columns that do not
  // exist — honouring them would widen the table by the sum of widths nothing
  // is ever rendered into, and hand it a scroll view to hold the surplus.
  const columnConstraints = reduceColumnConstraints(display.cells);
  if (columnConstraints.length === 0) {
    return [];
  }
  // Cell percentages use the same sizing class as col/colgroup percentages.
  // Repeated rows contribute a maximum, not a sum. A colspan shares its
  // preference across the columns it covers, like its intrinsic constraints.
  declaredWidths = [...declaredWidths];
  for (const cell of display.cells) {
    const percent = cell.constraints.percentWidth;
    if (percent == null) continue;
    for (let i = cell.x; i < cell.x + cell.lenX; i++) {
      const declared = declaredWidths[i];
      declaredWidths[i] = {
        width: null,
        minWidth: 0,
        maxWidth: null,
        maxPercent: null,
        ...declared,
        percent: Math.max(declared?.percent ?? 0, percent / cell.lenX)
      };
    }
  }
  // A `max-width` may be declared in either unit, and caps the column in
  // whichever sizing class it ends up in. Percentage bounds travel unresolved
  // so that the same declarations can be reused against another table width,
  // and are turned into pixels here, once that width is known.
  const caps = columnConstraints.map((_, i) => {
    const declared = declaredWidths[i];
    if (!declared) {
      return null;
    }
    return lesserBound(
      declared.maxWidth,
      declared.maxPercent === null ? null : declared.maxPercent * contentWidth
    );
  });
  for (const [i, constraints] of columnConstraints.entries()) {
    const declared = declaredWidths[i];
    if (!declared) {
      continue;
    }
    const cap = caps[i] ?? null;
    // Absolute column widths contribute to intrinsic minimum and preferred
    // widths. Percentage widths remain unresolved until distribution below,
    // and contribute only the absolute floor they were given.
    const floor = clampWidth(
      declared.width ?? declared.minWidth,
      declared.minWidth,
      cap
    );
    if (floor > 0) {
      constraints.minWidth = Math.max(constraints.minWidth, floor);
      constraints.spread = Math.max(constraints.spread, floor);
    }
    if (cap !== null) {
      // A `max-width` caps how far a column may grow, but never below the
      // width its own content needs to be legible at all.
      constraints.spread = Math.max(
        constraints.minWidth,
        Math.min(constraints.spread, cap)
      );
    }
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
    if (percent === null || percent === undefined) {
      return minWidth;
    }
    // The fraction is resolved here rather than at extraction, so that the
    // same declarations can be reused whenever the table is laid out again
    // against another width. A `max-width` caps the share in the same pass.
    const cap = caps[i];
    const preferred = percent * contentWidth;
    return Math.max(
      minWidth,
      cap == null ? preferred : Math.min(preferred, cap)
    );
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
  const allColumns = maxContentGuess.map((_, i) => i);
  // A column that declared a width of its own already has the width it asked
  // for; the surplus belongs to the ones that left it to the table to decide.
  const autoColumns = allColumns.filter((i) => {
    const declared = declaredWidths[i];
    return !declared || (declared.width === null && declared.percent === null);
  });
  const percentColumns = allColumns.filter((i) => percentages[i] != null);
  // Each class of column is offered the surplus in turn, so that what one
  // cannot take — every column in it held at its own `max-width` — falls
  // through to the next rather than being dropped and leaving the table short
  // of the width it was told to fill. Only when no column anywhere has room
  // left does the table stay narrower than its assignable width.
  let widths = maxContentGuess;
  for (const group of [autoColumns, percentColumns, allColumns]) {
    const leftover = contentWidth - sumOf(widths);
    if (leftover <= EPSILON) {
      break;
    }
    widths = addDistributedWidth(widths, leftover, group, caps);
  }
  return widths;
}
