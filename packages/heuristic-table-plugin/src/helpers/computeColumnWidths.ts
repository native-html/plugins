import { DisplayCell, TColumnConstraints } from '../shared-types';
import reduceColumnConstraints from './reduceColumnConstraints';
import type { DeclaredColumnWidth } from './extractColumnWidths';
import { clampWidth, lesserBound } from './resolveWidth';
import sum from './sum';

/** Below this many pixels a leftover is not worth another distribution pass. */
const EPSILON = 1e-6;

function mapMinWidths(constraints: TColumnConstraints[]): number[] {
  return constraints.map((c) => c.minWidth);
}

function mapSpreads(constraints: TColumnConstraints[]): number[] {
  return constraints.map((c) => c.spread);
}

/**
 * Share `total` across `weights`, proportionally. Falls back to an even share
 * when every weight is zero, so that no space is ever silently dropped.
 */
function distribute(total: number, weights: number[]): number[] {
  if (weights.length === 0) {
    return [];
  }
  const totalWeight = sum(weights);
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
  const lowerTotal = sum(lower);
  const upperTotal = sum(upper);
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
 *
 * The surplus is shared in proportion to how much *content* each column
 * already holds, not to its whole border box, so that spacing a column
 * happens to carry cannot earn it content width. It matters under the
 * collapsing border model, where each cell owns a different subset of the
 * boundaries around it — the cell in the last column has its trailing border
 * painted by the table wrapper rather than by itself — and weighting by the
 * border box would compound that difference instead of preserving it.
 *
 * @param insets - Each column's horizontal padding and border, which is held
 * out of the weighting. Defaults to none.
 */
function addDistributedWidth(
  widths: number[],
  total: number,
  indexes: number[],
  caps: Array<number | null>,
  insets: number[] = []
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
      // A column holding nothing but its own spacing weighs nothing, and so
      // waits while the columns with content grow. It is not stranded: once
      // they have all reached their caps it is the only candidate left, and
      // `distribute` shares evenly when every weight is zero.
      candidates.map((i) => Math.max(0, (result[i] ?? 0) - (insets[i] ?? 0)))
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

/**
 * What deciding column widths actually depends on.
 *
 * @remarks
 * Stated explicitly rather than taken from the whole layout: `assignableWidth`
 * is the width left for columns after the table's own padding, border and
 * border-spacing, which is a different quantity from the document width the
 * config calls `contentWidth`, and passing the latter by mistake is otherwise
 * invisible.
 */
export interface ColumnLayoutInput {
  cells: readonly DisplayCell[];
  /** The width the columns may share between them. */
  assignableWidth: number;
  /** Whether the columns must fill that width rather than shrink to fit. */
  forceStretch?: boolean;
}

export default function computeColumnWidths(
  { cells, assignableWidth, forceStretch }: ColumnLayoutInput,
  declaredWidths: Array<DeclaredColumnWidth | null> = []
): number[] {
  const contentWidth = assignableWidth;
  const shouldStretch = !!forceStretch;
  // The cell grid alone decides how many columns a table has. `col` and
  // `colgroup` declarations past its last column describe columns that do not
  // exist — honouring them would widen the table by the sum of widths nothing
  // is ever rendered into, and hand it a scroll view to hold the surplus.
  const columnConstraints = reduceColumnConstraints([...cells]);
  if (columnConstraints.length === 0) {
    return [];
  }
  // Cell percentages use the same sizing class as col/colgroup percentages,
  // and `reduceColumnConstraints` has already spread each spanning cell's
  // preference over the columns it covers.
  const declarations = columnConstraints.map((constraints, i) => {
    const declared = declaredWidths[i];
    const percent = constraints.percentWidth;
    if (percent == null) {
      return declared ?? null;
    }
    return {
      width: null,
      minWidth: 0,
      maxWidth: null,
      maxPercent: null,
      ...declared,
      percent: Math.max(declared?.percent ?? 0, percent)
    };
  });
  // A `max-width` may be declared in either unit, and caps the column in
  // whichever sizing class it ends up in. Percentage bounds travel unresolved
  // so that the same declarations can be reused against another table width,
  // and are turned into pixels here, once that width is known.
  const caps = columnConstraints.map((_, i) => {
    const declared = declarations[i];
    if (!declared) {
      return null;
    }
    return lesserBound(
      declared.maxWidth,
      declared.maxPercent === null ? null : declared.maxPercent * contentWidth
    );
  });
  for (const [i, constraints] of columnConstraints.entries()) {
    const declared = declarations[i];
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
    // A `max-width` caps how far a column may grow, but never below the
    // width its own content needs to be legible at all.
    constraints.spread = clampWidth(constraints.spread, constraints.minWidth, cap);
  }
  const minWidths = mapMinWidths(columnConstraints);
  const spreads = mapSpreads(columnConstraints);
  const sumOfMinWidths = sum(minWidths);
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
    declarations,
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
  const percentageGuessTotal = sum(percentageGuess);
  if (contentWidth <= percentageGuessTotal) {
    return interpolateWidths(minWidths, percentageGuess, contentWidth);
  }

  // Next move non-percentage columns from min-content toward max-content. A
  // percentage column keeps the width assigned by the percentage sizing guess.
  const maxContentGuess = percentageGuess.map((width, i) =>
    percentages[i] == null ? Math.max(width, spreads[i] ?? 0) : width
  );
  const maxContentGuessTotal = sum(maxContentGuess);
  if (contentWidth <= maxContentGuessTotal) {
    return interpolateWidths(percentageGuess, maxContentGuess, contentWidth);
  }

  // An auto-width table can shrink to its max-content size. An explicitly
  // sized table (or forceStretch) must distribute the remaining assignable
  // width so that the columns add up to the table width.
  if (!shouldStretch) {
    return maxContentGuess;
  }
  // The spacing each column carries, so that the surplus below is shared over
  // content alone; `reduceColumnConstraints` reduced it the same way it
  // reduced `minWidth`, which is the figure the spacing is held out of.
  const columnInsets = columnConstraints.map((c) => c.horizontalSpace);
  const allColumns = maxContentGuess.map((_, i) => i);
  // A column that declared a width of its own already has the width it asked
  // for; the surplus belongs to the ones that left it to the table to decide.
  const autoColumns = allColumns.filter((i) => {
    const declared = declarations[i];
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
    const leftover = contentWidth - sum(widths);
    if (leftover <= EPSILON) {
      break;
    }
    widths = addDistributedWidth(widths, leftover, group, caps, columnInsets);
  }
  return widths;
}
