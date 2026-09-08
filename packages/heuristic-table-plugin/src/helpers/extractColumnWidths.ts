import { TNode } from '@native-html/render';
import {
  lesserBound,
  resolveAttributeLength,
  resolvePercentage
} from './resolveWidth';

/**
 * The width declarations a `col` or its `colgroup` contributes to one column.
 *
 * @remarks
 * The properties are deliberately kept apart. A declared width and a bound
 * are different things — conflating them lets a `min-width` on a column
 * discard the width declared by its group — and a width and a fraction belong
 * to different sizing classes, which `computeColumnWidths` reconciles only
 * once it knows the width to assign.
 *
 * None of them is resolved against a containing width: a declaration is a
 * property of the markup, not of the box the table happens to be laid out in,
 * and one resolved against a first guess at the table width could not be
 * reused for a second.
 */
export interface DeclaredColumnWidth {
  /**
   * An absolute width declared by the column or its group; `null` when the
   * declaration is a percentage, or when there is none.
   */
  width: number | null;
  /** A preferred fraction of the assignable table width. */
  percent: number | null;
  /** An absolute lower bound from `min-width`; `0` when none is declared. */
  minWidth: number;
  /** An absolute upper bound from `max-width`. */
  maxWidth: number | null;
  /**
   * An upper bound from a percentage `max-width`, as a fraction of the
   * assignable table width; `null` when there is none.
   */
  maxPercent: number | null;
}

const MAX_SPAN = 1000;

function parseSpan(value: unknown): number {
  const parsed = typeof value === 'string' ? Number(value.trim()) : NaN;
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.min(Math.max(Math.floor(parsed), 1), MAX_SPAN);
}

function appendWidth(
  widths: Array<DeclaredColumnWidth | null>,
  width: DeclaredColumnWidth | null,
  span: number
) {
  for (let i = 0; i < span; i++) {
    widths.push(width);
  }
}

/**
 * Combine the width of a `colgroup` with that of one of its `col` children.
 *
 * @remarks
 * The column overrides its group rather than competing with it: a group width
 * applies only to the columns that declare none of their own, so a 25% `col`
 * inside a 50% `colgroup` is 25% wide — taking the greater of the two would
 * let a group widen the very column that asked to be narrower. A declaration
 * in either sizing class counts, so a percentage `col` replaces an absolute
 * group width just as it would another percentage.
 *
 * Bounds are not declarations and do not override: the group box contains the
 * column box, so both apply and the stricter one wins.
 */
function mergeWidths(
  group: DeclaredColumnWidth | null,
  column: DeclaredColumnWidth | null
): DeclaredColumnWidth | null {
  if (!group) return column;
  if (!column) return group;
  const columnDeclaresWidth = column.width !== null || column.percent !== null;
  return {
    width: columnDeclaresWidth ? column.width : group.width,
    percent: columnDeclaresWidth ? column.percent : group.percent,
    minWidth: Math.max(column.minWidth, group.minWidth),
    maxWidth: lesserBound(column.maxWidth, group.maxWidth),
    maxPercent: lesserBound(column.maxPercent, group.maxPercent)
  };
}

/**
 * A processed absolute length. Percentages arrive as strings and are read by
 * `resolvePercentage` instead, which keeps them unresolved.
 */
function absoluteSize(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function resolveColumnWidth(tnode: TNode): DeclaredColumnWidth | null {
  const style = tnode.styles.nativeBlockRet;
  const cssPercent = resolvePercentage(style.width);
  const cssAbsolute = absoluteSize(style.width);
  // `auto` is still a CSS width declaration and therefore suppresses the
  // lower-priority HTML presentational hint, despite contributing no size.
  const hasCssWidth = style.width != null;
  // The presentational attribute stands in for a missing CSS width, in
  // whichever unit it is written.
  const declaredPercent =
    cssPercent ??
    (hasCssWidth ? null : resolvePercentage(tnode.attributes.width));
  // A percentage `min-width` contributes nothing to table-internal percentage
  // sizing, so only an absolute lower bound is kept. A percentage `max-width`,
  // on the other hand, caps the declared fraction in its own unit and travels
  // on as a fraction, so that it also caps an absolute width once
  // `computeColumnWidths` knows the width to resolve it against.
  const minWidth = absoluteSize(style.minWidth) ?? 0;
  const maxWidth = absoluteSize(style.maxWidth);
  const maxPercent = resolvePercentage(style.maxWidth);
  const percent =
    declaredPercent === null
      ? null
      : Math.min(declaredPercent, maxPercent ?? declaredPercent);
  const width =
    percent !== null
      ? null
      : (cssAbsolute ??
        (hasCssWidth ? null : resolveAttributeLength(tnode.attributes.width)));
  if (
    width === null &&
    percent === null &&
    minWidth === 0 &&
    maxWidth === null &&
    maxPercent === null
  ) {
    return null;
  }
  return { width, percent, minWidth, maxWidth, maxPercent };
}

function appendColgroupWidths(
  widths: Array<DeclaredColumnWidth | null>,
  colgroup: TNode
) {
  const groupWidth = resolveColumnWidth(colgroup);
  const columns = colgroup.children.filter((child) => child.tagName === 'col');
  if (columns.length === 0) {
    appendWidth(widths, groupWidth, parseSpan(colgroup.attributes.span));
    return;
  }
  for (const column of columns) {
    appendWidth(
      widths,
      mergeWidths(groupWidth, resolveColumnWidth(column)),
      parseSpan(column.attributes.span)
    );
  }
}

/** Collect the ordered widths declared by colgroup and col elements. */
export default function extractColumnWidths(
  table: TNode
): Array<DeclaredColumnWidth | null> {
  const widths: Array<DeclaredColumnWidth | null> = [];
  for (const child of table.children) {
    if (child.tagName === 'colgroup') {
      appendColgroupWidths(widths, child);
    } else if (child.tagName === 'col') {
      appendWidth(
        widths,
        resolveColumnWidth(child),
        parseSpan(child.attributes.span)
      );
    }
  }
  return widths;
}
