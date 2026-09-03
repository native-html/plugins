import { TNode } from '@native-html/render';
import {
  clampWidth,
  resolveAttributeSize,
  resolveCssSize,
  resolvePercentage
} from './resolveWidth';

export interface DeclaredColumnWidth {
  /** An absolute lower bound contributed by the column or column group. */
  minWidth: number;
  /** A preferred fraction of the assignable table width. */
  percent: number | null;
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

function mergeWidths(
  group: DeclaredColumnWidth | null,
  column: DeclaredColumnWidth | null
): DeclaredColumnWidth | null {
  if (!group) return column;
  if (!column) return group;
  return {
    minWidth: Math.max(group.minWidth, column.minWidth),
    percent:
      group.percent === null
        ? column.percent
        : column.percent === null
        ? group.percent
        : Math.max(group.percent, column.percent)
  };
}

/**
 * Keep percentage widths unresolved. Browsers carry these as intrinsic
 * percentage contributions and reconcile them during width distribution.
 */
function resolveColumnWidth(
  tnode: TNode,
  containingWidth: number
): DeclaredColumnWidth | null {
  const style = tnode.styles.nativeBlockRet;
  const cssPercent = resolvePercentage(style.width);
  const cssAbsolute = resolveCssSize(style.width, containingWidth);
  const hasCssWidth = cssPercent !== null || cssAbsolute !== null;
  const attributePercent = hasCssWidth
    ? null
    : resolvePercentage(tnode.attributes.width);
  const percent = cssPercent ?? attributePercent;
  // Percentage min-width does not contribute to table-internal percentage
  // sizing. Keep only an absolute lower bound here.
  const absoluteMin =
    typeof style.minWidth === 'number' && Number.isFinite(style.minWidth)
      ? Math.max(0, style.minWidth)
      : 0;
  if (percent !== null) {
    const percentageMax = resolvePercentage(style.maxWidth);
    return {
      minWidth: absoluteMin,
      percent:
        percentageMax === null ? percent : Math.min(percent, percentageMax)
    };
  }
  const absolute =
    cssAbsolute ??
    (hasCssWidth
      ? null
      : resolveAttributeSize(tnode.attributes.width, containingWidth));
  if (absolute === null && absoluteMin === 0) {
    return null;
  }
  const absoluteMax =
    typeof style.maxWidth === 'number' && Number.isFinite(style.maxWidth)
      ? Math.max(0, style.maxWidth)
      : null;
  return {
    minWidth: clampWidth(
      absolute ?? absoluteMin,
      absoluteMin,
      absoluteMax
    ),
    percent: null
  };
}

function appendColgroupWidths(
  widths: Array<DeclaredColumnWidth | null>,
  colgroup: TNode,
  containingWidth: number
) {
  const groupWidth = resolveColumnWidth(colgroup, containingWidth);
  const columns = colgroup.children.filter((child) => child.tagName === 'col');
  if (columns.length === 0) {
    appendWidth(widths, groupWidth, parseSpan(colgroup.attributes.span));
    return;
  }
  for (const column of columns) {
    appendWidth(
      widths,
      mergeWidths(groupWidth, resolveColumnWidth(column, containingWidth)),
      parseSpan(column.attributes.span)
    );
  }
}

/** Collect the ordered widths declared by colgroup and col elements. */
export default function extractColumnWidths(
  table: TNode,
  containingWidth: number
): Array<DeclaredColumnWidth | null> {
  const widths: Array<DeclaredColumnWidth | null> = [];
  for (const child of table.children) {
    if (child.tagName === 'colgroup') {
      appendColgroupWidths(widths, child, containingWidth);
    } else if (child.tagName === 'col') {
      appendWidth(
        widths,
        resolveColumnWidth(child, containingWidth),
        parseSpan(child.attributes.span)
      );
    }
  }
  return widths;
}
