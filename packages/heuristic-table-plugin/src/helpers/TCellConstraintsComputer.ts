import pipe from 'ramda/src/pipe';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import max from 'ramda/src/max';
import reduce from 'ramda/src/reduce';
import { TNode } from '@native-html/render';
import { TCellConstraints, TConstraintsBase } from '../shared-types';
import { getHorizontalMargins, getHorizontalSpacing } from './measure';
import { resolveCssSize, resolveImposedWidth } from './resolveWidth';

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

/**
 * Whitespace that forbids a line break rather than offering one.
 *
 * @remarks
 * `\s` cannot be used on its own to find break opportunities, because it also
 * matches the spaces authors reach for precisely to keep two words together:
 * U+00A0 NO-BREAK SPACE, U+202F NARROW NO-BREAK SPACE and U+2007 FIGURE SPACE
 * are all glue in {@link https://www.unicode.org/reports/tr14/ | UAX #14}, and
 * U+FEFF is a word joiner. `10&nbsp;000&nbsp;km` is one unbreakable run of ten
 * characters, not three of two, three and two.
 */
const NON_BREAKING_SPACE_REGEX = /[\u00a0\u202f\u2007\ufeff]/u;

const DIGIT_REGEX = /^\d$/u;

function isBreakingSpace(character: string): boolean {
  return /\s/u.test(character) && !NON_BREAKING_SPACE_REGEX.test(character);
}

function isDigit(character: string | undefined): boolean {
  return character !== undefined && DIGIT_REGEX.test(character);
}

function getMaxUnbreakableTextLength(text: string): number {
  const characters = Array.from(text);
  let currentLength = 0;
  let maxLength = 0;
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i] as string;
    if (isBreakingSpace(character)) {
      currentLength = 0;
      continue;
    }
    currentLength += character.length;
    maxLength = Math.max(maxLength, currentLength);
    // A line can break after a regular hyphen, but never between two digits
    // (UAX #14 LB25) — that would split `2026-09-03` or a phone number across
    // two lines. Keep the hyphen in the preceding segment because it still
    // occupies space at the line end. U+2011 NON-BREAKING HYPHEN is
    // deliberately not included.
    const isHyphen = character === '-' || character === '\u2010';
    if (
      isHyphen &&
      !(isDigit(characters[i - 1]) && isDigit(characters[i + 1]))
    ) {
      currentLength = 0;
    }
  }
  return maxLength;
}

/**
 * How much wider text renders at a given font weight than at a regular one.
 *
 * @remarks
 * Keys are matched against the resolved `fontWeight` stringified, so both the
 * numeric weights React Native accepts and the `normal`/`bold` keywords are
 * looked up here. A weight with no entry falls back to a coefficient of 1.
 *
 * @public
 */
export type FontWeightCoefficients = Record<string, number>;

/**
 * The coefficients used when the config supplies none.
 *
 * @remarks
 * A user-supplied map is merged over these rather than replacing them, so a
 * config may retune `bold` alone without restating all nine numeric weights.
 *
 * @public
 */
export const DEFAULT_FONT_WEIGHT_COEFFS: FontWeightCoefficients = {
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

export default class TCellConstraintsComputer {
  private baseFontCoeff: number;
  private fallbackFontSize: number;
  private contentWidth: number;
  private fontWeightCoeffs: FontWeightCoefficients;

  constructor({
    baseFontCoeff,
    fallbackFontSize,
    fontWeightCoeffs,
    contentWidth
  }: {
    baseFontCoeff?: number;
    fallbackFontSize?: number;
    /**
     * Per-weight width coefficients, merged over
     * {@link DEFAULT_FONT_WEIGHT_COEFFS}.
     */
    fontWeightCoeffs?: FontWeightCoefficients;
    /**
     * The width of the table's containing block, against which percentage
     * widths are resolved.
     */
    contentWidth?: number;
  }) {
    this.baseFontCoeff = baseFontCoeff ?? 0.65;
    this.fallbackFontSize = fallbackFontSize ?? 14;
    this.fontWeightCoeffs = fontWeightCoeffs
      ? { ...DEFAULT_FONT_WEIGHT_COEFFS, ...fontWeightCoeffs }
      : DEFAULT_FONT_WEIGHT_COEFFS;
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
    stats: TCellStats = getInitCellStatsForTnode(tnode),
    isCellRoot = true
  ): TCellStats {
    if (tnode.type === 'text') {
      const fontSize =
        tnode.styles.nativeTextFlow.fontSize ?? this.fallbackFontSize;
      const fontWeight = tnode.styles.nativeTextFlow.fontWeight ?? 'normal';
      const fontWeightCoeff = this.fontWeightCoeffs[String(fontWeight)] ?? 1;
      stats.textStats.push({
        characters: tnode.data.length,
        maxWordLength: getMaxUnbreakableTextLength(tnode.data),
        fontFamilyCoeff: 1,
        fontSize,
        fontWeightCoeff
      });
    } else {
      if (tnode.type === 'block') {
        const width = this.resolveBlockWidth(tnode, isCellRoot);
        if (width !== null) {
          const margins = getHorizontalMargins(tnode.styles.nativeBlockRet);
          stats.blockWidth = Math.max(stats.blockWidth, width + margins);
        }
      }
      tnode.children.forEach((n) => this.assembleCellStats(n, stats, false));
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
  private resolveBlockWidth(tnode: TNode, isCellRoot: boolean): number | null {
    return resolveImposedWidth(tnode, this.contentWidth, {
      // The cell's percentage width resolves against the table. A descendant's
      // percentage resolves against the eventual cell content box, which is
      // precisely what this intrinsic-width pass is still trying to discover.
      resolvePercentages: isCellRoot
    });
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
