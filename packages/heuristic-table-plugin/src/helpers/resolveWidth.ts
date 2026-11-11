import { ViewStyle } from 'react-native';
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

/**
 * Resolve the unitless form of an HTML presentational width attribute, the
 * only one that needs no containing block to make sense of.
 */
export function resolveAttributeLength(value: unknown): number | null {
  if (typeof value !== 'string') {
    return null;
  }
  const unitless = UNITLESS_REGEX.exec(value.trim());
  return unitless ? Number(unitless[1]) : null;
}

/** Resolve an HTML presentational width attribute. */
export function resolveAttributeSize(
  value: unknown,
  containingWidth: number
): number | null {
  if (typeof value !== 'string') {
    return null;
  }
  const percentage = PERCENTAGE_REGEX.exec(value.trim());
  if (percentage) {
    return (containingWidth * Number(percentage[1])) / 100;
  }
  return resolveAttributeLength(value);
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

/** The stricter of two upper bounds, either of which may be absent. */
export function lesserBound(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.min(a, b);
}

export interface WidthConstraints {
  /**
   * The width specified by the element, resolved against its containing block;
   * `null` when the width is `auto`.
   */
  width: number | null;
  minWidth: number | null;
  maxWidth: number | null;
}

interface ResolveWidthOptions {
  style?: ViewStyle;
  /**
   * Percentage sizes do not impose an intrinsic width on a descendant whose
   * containing block has not been sized yet.
   */
  resolvePercentages?: boolean;
}

/**
 * Resolve the three width properties of an element independently.
 *
 * @remarks
 * They are kept apart on purpose. A `min-width` is a floor and a `max-width` a
 * ceiling on whatever width the element ends up using — neither is itself a
 * declared width, and treating one as such makes an element take the width of
 * its own bound rather than the width it was offered. Callers combine them
 * with {@link clampWidth} once they know the width to clamp.
 *
 * CSS wins over the HTML `width` hint, which is consulted last as befits a
 * presentational attribute.
 */
export function resolveWidthConstraints(
  tnode: TNode,
  containingWidth: number,
  { resolvePercentages = true, style }: ResolveWidthOptions = {}
): WidthConstraints {
  const blockStyle = style ?? tnode.styles.nativeBlockRet;
  const resolveCss = (value: unknown) =>
    resolvePercentages || typeof value === 'number'
      ? resolveCssSize(value, containingWidth)
      : null;
  const resolveAttribute = (value: unknown) =>
    resolvePercentages
      ? resolveAttributeSize(value, containingWidth)
      : resolveAttributeLength(value);
  // A presentational width is a lowest-priority CSS hint. It only participates
  // when CSS supplied no width declaration at all; an explicit `width:auto`
  // still wins even though it resolves to no numeric width here.
  const hasCssWidth = blockStyle.width != null;
  return {
    width: hasCssWidth
      ? resolveCss(blockStyle.width)
      : resolveAttribute(tnode.attributes.width),
    minWidth: resolveCss(blockStyle.minWidth),
    maxWidth: resolveCss(blockStyle.maxWidth)
  };
}

/**
 * The width an element *imposes* on the box that holds it, or `null` when it
 * imposes none.
 *
 * @remarks
 * A lone `min-width` counts here, unlike when resolving the width an element
 * will be *given*: a block demanding at least 200px makes its container at
 * least that wide even with an `auto` width. This is the bound a table cell
 * needs from its contents, not a width the block itself takes.
 */
export function resolveImposedWidth(
  tnode: TNode,
  containingWidth: number,
  options?: ResolveWidthOptions
): number | null {
  const { width, minWidth, maxWidth } = resolveWidthConstraints(
    tnode,
    containingWidth,
    options
  );
  if (width === null && minWidth === null) {
    return null;
  }
  return clampWidth(width ?? minWidth ?? 0, minWidth, maxWidth);
}
