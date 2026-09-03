import { TNode } from '@native-html/render';

const PERCENTAGE_REGEX = /^(\d*\.?\d+)%$/;
const UNITLESS_REGEX = /^(\d*\.?\d+)$/;

/** Resolve a processed CSS width against its containing block. */
export function resolveCssSize(
  value: unknown,
  containingWidth: number
): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }
  if (typeof value === 'string') {
    const percentage = PERCENTAGE_REGEX.exec(value.trim());
    if (percentage) {
      return (containingWidth * Number(percentage[1])) / 100;
    }
  }
  return null;
}

/** Return a CSS/HTML percentage as a ratio without resolving it to pixels. */
export function resolvePercentage(value: unknown): number | null {
  if (typeof value !== 'string') {
    return null;
  }
  const percentage = PERCENTAGE_REGEX.exec(value.trim());
  return percentage ? Number(percentage[1]) / 100 : null;
}

/** Resolve an HTML presentational width attribute. */
export function resolveAttributeSize(
  value: unknown,
  containingWidth: number
): number | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  const percentage = PERCENTAGE_REGEX.exec(trimmed);
  if (percentage) {
    return (containingWidth * Number(percentage[1])) / 100;
  }
  const unitless = UNITLESS_REGEX.exec(trimmed);
  return unitless ? Number(unitless[1]) : null;
}

/** Apply the CSS max-width, then min-width clamping order. */
export function clampWidth(
  width: number,
  minWidth: number | null,
  maxWidth: number | null
): number {
  let used = width;
  if (maxWidth !== null) {
    used = Math.min(used, maxWidth);
  }
  if (minWidth !== null) {
    used = Math.max(used, minWidth);
  }
  return used;
}

/**
 * Resolve the width imposed by an element. CSS wins over the HTML width hint;
 * min/max-width clamp it using normal CSS precedence.
 */
export function resolveNodeWidth(
  tnode: TNode,
  containingWidth: number
): number | null {
  const blockStyle = tnode.styles.nativeBlockRet;
  const minWidth = resolveCssSize(blockStyle.minWidth, containingWidth);
  const maxWidth = resolveCssSize(blockStyle.maxWidth, containingWidth);
  const cssWidth = resolveCssSize(blockStyle.width, containingWidth);
  const width =
    cssWidth ?? resolveAttributeSize(tnode.attributes.width, containingWidth);
  if (width === null && minWidth === null) {
    return null;
  }
  return clampWidth(width ?? minWidth ?? 0, minWidth, maxWidth);
}
