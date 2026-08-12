import pipe from 'ramda/src/pipe';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import max from 'ramda/src/max';
import prop from 'ramda/src/prop';
import reduce from 'ramda/src/reduce';
import { TNode } from '@native-html/render';
import { TCellConstraints, TConstraintsBase } from '../shared-types';
import { getHorizontalMargins, getHorizontalSpacing } from './measure';

interface TextChunkStats {
  fontWeightCoeff: number;
  fontFamilyCoeff: number;
  fontSize: number;
  characters: number;
  maxWordLength: number;
}

/**
 * Distinction between two types of content generating constraints.
 *
 * - Blocks. When blocks such as images have an explicit width, this width is
 *   used as minimum and prefered width for this tnode cell.
 * - TPhrasing. Phrasing content will provide minimum and prefered width up to approx 10 characters. Above that,
 *   each new character will augment prefered width logarathmically, since text wraps nicely.
 */
interface TCellStats {
  /**
   * Horizontal spacing for this cell
   */
  horizontalSpace: number;
  /**
   * The maximum of explicit widths or min-widths of block elements in this
   * cell, including margins.
   */
  blockWidth: number;
  /**
   * Text stats in this cell.
   */
  textStats: TextChunkStats[];
}

function getInitCellStatsForTnode(tnode: TNode): TCellStats {
  return {
    blockWidth: 0,
    horizontalSpace: getHorizontalSpacing(tnode.styles.nativeBlockRet),
    textStats: []
  };
}

const getMaxWordSize = pipe(
  map<string, number>(prop('length')),
  reduce<number, number>(max, 0)
);

const PERCENTAGE_REGEX = /^(\d*\.?\d+)%$/;
const UNITLESS_REGEX = /^(\d*\.?\d+)$/;

/**
 * Resolve a CSS length coming from `nativeBlockRet` to pixels.
 *
 * @remarks
 * The CSS processor hands us absolute lengths already reduced to numbers, but
 * leaves percentages as strings such as `"50%"` — those resolve against the
 * table's containing block, which is `contentWidth` here. Keywords (`auto`,
 * `min-content`, …) and any value we cannot resolve yield `null`, meaning
 * "unconstrained", exactly as an `auto` width would.
 */
function resolveCssSize(value: unknown, contentWidth: number): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }
  if (typeof value === 'string') {
    const percentage = PERCENTAGE_REGEX.exec(value.trim());
    if (percentage) {
      return (contentWidth * Number(percentage[1])) / 100;
    }
  }
  return null;
}

/**
 * Resolve an HTML presentational `width` attribute to pixels.
 *
 * @remarks
 * Unlike CSS, the attribute takes a bare number of pixels (`width="200"`) as
 * well as a percentage (`width="50%"`). It is a presentational hint of the
 * lowest priority, so any CSS `width` supersedes it.
 */
function resolveAttributeSize(
  value: unknown,
  contentWidth: number
): number | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  const percentage = PERCENTAGE_REGEX.exec(trimmed);
  if (percentage) {
    return (contentWidth * Number(percentage[1])) / 100;
  }
  const unitless = UNITLESS_REGEX.exec(trimmed);
  return unitless ? Number(unitless[1]) : null;
}

/**
 * Apply the CSS clamping order to a width: `min-width` beats `max-width`, which
 * beats `width` ({@link https://www.w3.org/TR/CSS21/visudet.html#min-max-widths | CSS 2.1 §10.4}).
 */
function clampWidth(
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


export default class TCellConstraintsComputer {
  private baseFontCoeff: number;
  private fallbackFontSize: number;
  private contentWidth: number;

  private fontWeightCoeffs: Record<string, number> = {
    '100': 0.8,
    '200': 0.85,
    '300': 0.9,
    '400': 1,
    '500': 1.1,
    '600': 1.2,
    '700': 1.3,
    '800': 1.4,
    '900': 1.5,
    bold: 1.3,
    normal: 1
  };

  constructor({
    baseFontCoeff,
    fallbackFontSize,
    contentWidth
  }: {
    baseFontCoeff?: number;
    fallbackFontSize?: number;
    /**
     * The width of the table's containing block, against which percentage
     * widths are resolved.
     */
    contentWidth?: number;
  }) {
    this.baseFontCoeff = baseFontCoeff ?? 0.65;
    this.fallbackFontSize = fallbackFontSize ?? 14;
    this.contentWidth = contentWidth ?? 0;
  }

  private getContentDensity = pipe(
    map<TextChunkStats, number>((ch) => ch.characters * this.getTextCoeff(ch)),
    sum
  );

  private geTextMinWidth = pipe(
    map<TextChunkStats, number>(
      (ch) => ch.maxWordLength * this.getTextCoeff(ch)
    ),
    reduce<number, number>(max, 0)
  );

  private getTextCoeff(ch: TextChunkStats): number {
    return (
      ch.fontFamilyCoeff * ch.fontSize * this.baseFontCoeff * ch.fontWeightCoeff
    );
  }

  private assembleCellStats(
    tnode: TNode,
    stats: TCellStats = getInitCellStatsForTnode(tnode)
  ): TCellStats {
    if (tnode.type === 'text') {
      const fontSize =
        tnode.styles.nativeTextFlow.fontSize ?? this.fallbackFontSize;
      const fontWeight = tnode.styles.nativeTextFlow.fontWeight ?? 'normal';
      const fontWeightCoeff = this.fontWeightCoeffs[String(fontWeight)] ?? 1;
      stats.textStats.push({
        characters: tnode.data.length,
        maxWordLength: getMaxWordSize(tnode.data.split(/\s+/)),
        fontFamilyCoeff: 1,
        fontSize,
        fontWeightCoeff
      });
    } else {
      if (tnode.type === 'block') {
        const width = this.resolveBlockWidth(tnode);
        if (width !== null) {
          const margins = getHorizontalMargins(tnode.styles.nativeBlockRet);
          stats.blockWidth = Math.max(stats.blockWidth, width + margins);
        }
      }
      tnode.children.forEach((n) => this.assembleCellStats(n, stats));
    }
    return stats;
  }

  /**
   * The width a block imposes on the cell holding it, or `null` when it
   * imposes none.
   *
   * @remarks
   * A specified `width` is a preference, but `min-width` and `max-width` clamp
   * it in that order ({@link https://www.w3.org/TR/CSS21/visudet.html#min-max-widths | CSS 2.1 §10.4}),
   * so a `min-width` larger than `max-width` wins — matching a browser. When no
   * `width` is given, `min-width` alone still imposes a floor. The HTML
   * presentational `width` attribute is consulted last, as befits a hint of the
   * lowest priority.
   */
  private resolveBlockWidth(tnode: TNode): number | null {
    const blockStyle = tnode.styles.nativeBlockRet;
    const minWidth = resolveCssSize(blockStyle.minWidth, this.contentWidth);
    const maxWidth = resolveCssSize(blockStyle.maxWidth, this.contentWidth);
    const cssWidth = resolveCssSize(blockStyle.width, this.contentWidth);
    const width =
      cssWidth ??
      resolveAttributeSize(tnode.attributes.width, this.contentWidth);
    if (width === null && minWidth === null) {
      return null;
    }
    return clampWidth(width ?? minWidth ?? 0, minWidth, maxWidth);
  }

  private computeTextConstraints(chunks: TextChunkStats[]): TConstraintsBase {
    const minWidth = this.geTextMinWidth(chunks);
    const contentDensity = this.getContentDensity(chunks);
    return {
      minWidth,
      contentDensity
    };
  }

  computeCellConstraints(tnode: TNode): TCellConstraints {
    const stats = this.assembleCellStats(tnode);
    const blockWidth = stats.blockWidth;
    const textConstrains = this.computeTextConstraints(stats.textStats);
    // A `max-width` on the cell itself caps the whole cell box. A descendant's
    // `max-width` must not, since it only bounds that descendant.
    const cellMaxWidth = resolveCssSize(
      tnode.styles.nativeBlockRet.maxWidth,
      this.contentWidth
    );
    // Per CSS 2.1 §17.5.2.2, "if the specified 'width' (W) of the cell is
    // greater than MCW, W is the minimum cell width", and the maximum cell
    // width is likewise raised by the column 'width'. So an explicit width
    // lifts *both* bounds — never just one, or the cell would end up
    // narrower than the width it asked for.
    const minWidth =
      Math.max(blockWidth, textConstrains.minWidth) + stats.horizontalSpace;
    const maxWidth =
      Math.max(blockWidth, textConstrains.contentDensity) +
      stats.horizontalSpace;
    return {
      minWidth,
      // `max-width` caps the width the cell would *like*, but never takes it
      // below the width it needs to hold its longest word: min-content is a
      // floor no browser crosses.
      maxWidth:
        cellMaxWidth === null
          ? maxWidth
          : Math.max(minWidth, Math.min(maxWidth, cellMaxWidth)),
      contentDensity: textConstrains.contentDensity
    };
  }
}
