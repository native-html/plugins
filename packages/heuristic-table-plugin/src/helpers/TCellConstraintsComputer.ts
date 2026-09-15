import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import { TCellConstraints } from '../shared-types';
import { getHorizontalInsets, getHorizontalMargins } from './measure';
import { getPaintedBlockStyle } from './tableStyles';
import {
  resolveCssSize,
  resolveImposedWidth,
  resolvePercentage
} from './resolveWidth';

interface TextChunkStats {
  fontWeightCoeff: number;
  fontFamilyCoeff: number;
  fontSize: number;
  text: string;
}

interface TCellStats {
  /**
   * The cell's own horizontal insets: its padding and border. Margins are
   * excluded because the cell renderer zeroes them, so reserving column width
   * for one would leave a gap nothing ever paints.
   */
  horizontalSpace: number;
  /**
   * The maximum of explicit widths or min-widths of the block elements *inside*
   * this cell, including margins. Content-box against the cell, so the cell's
   * own horizontal spacing still has to be added on top.
   */
  blockWidth: number;
  /**
   * The border-box width the cell itself declares, or `null` when it declares
   * none. Already holds the cell's padding and border.
   */
  cellBoxWidth: number | null;
  /**
   * Text stats in this cell.
   */
  textStats: TextChunkStats[][];
}

function getInitCellStats(style: ViewStyle): TCellStats {
  return {
    blockWidth: 0,
    cellBoxWidth: null,
    horizontalSpace: getHorizontalInsets(style),
    textStats: [[]]
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

  private getTextCoeff(ch: TextChunkStats): number {
    return (
      ch.fontFamilyCoeff * ch.fontSize * this.baseFontCoeff * ch.fontWeightCoeff
    );
  }

  private assembleCellStats(
    tnode: TNode,
    stats: TCellStats,
    cellStyle?: ViewStyle
  ): TCellStats {
    if (tnode.tagName === 'br') {
      stats.textStats.push([]);
    } else if (tnode.type === 'text') {
      const fontSize =
        tnode.styles.nativeTextFlow.fontSize ?? this.fallbackFontSize;
      const fontWeight = tnode.styles.nativeTextFlow.fontWeight ?? 'normal';
      const fontWeightCoeff = this.fontWeightCoeffs[String(fontWeight)] ?? 1;
      stats.textStats[stats.textStats.length - 1]!.push({
        text: tnode.data,
        fontFamilyCoeff: 1,
        fontSize,
        fontWeightCoeff
      });
    } else {
      // Inline wrappers do not introduce a word boundary. Blocks and explicit
      // line breaks separate text on both sides of their contents.
      const separatesText = tnode.type === 'block';
      if (separatesText) {
        stats.textStats.push([]);
      }
      if (tnode.type === 'block') {
        const width = this.resolveBlockWidth(tnode, cellStyle);
        if (width !== null) {
          if (cellStyle) {
            // React Native lays out with `box-sizing: border-box`, and CSS
            // gives a table cell that same box model, so the width a cell
            // declares already holds its padding and border. It is kept apart
            // from the descendant widths below, which are content-box against
            // the cell and so do have to grow by its spacing. Margins play no
            // part either: a table cell has none, and the cell renderer zeroes
            // whatever a stylesheet asked for.
            stats.cellBoxWidth = width;
          } else {
            const margins = getHorizontalMargins(tnode.styles.nativeBlockRet);
            stats.blockWidth = Math.max(stats.blockWidth, width + margins);
          }
        }
      }
      tnode.children.forEach((n) => this.assembleCellStats(n, stats));
      if (separatesText) {
        stats.textStats.push([]);
      }
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
  private resolveBlockWidth(tnode: TNode, style?: ViewStyle): number | null {
    return resolveImposedWidth(tnode, this.contentWidth, {
      // Cell percentages are preferences reconciled during column distribution.
      // Descendant percentages depend on the as-yet unknown cell content box.
      resolvePercentages: false,
      style
    });
  }

  private computeTextConstraints(runs: TextChunkStats[][]) {
    let minWidth = 0;
    let contentDensity = 0;
    let maxWidth = 0;
    for (const chunks of runs) {
      const characters = chunks.flatMap((chunk) =>
        Array.from(chunk.text, (character) => ({
          character,
          width: character.length * this.getTextCoeff(chunk)
        }))
      );
      let wordWidth = 0;
      let lineWidth = 0;
      for (let i = 0; i < characters.length; i++) {
        const { character, width } = characters[i]!;
        contentDensity += width;
        lineWidth += width;
        if (isBreakingSpace(character)) {
          wordWidth = 0;
          continue;
        }
        wordWidth += width;
        minWidth = Math.max(minWidth, wordWidth);
        // Keep numeric hyphens unbroken even when adjacent digits belong to
        // different styled nodes. Other hyphens stay in the preceding word.
        const isHyphen = character === '-' || character === '\u2010';
        if (
          isHyphen &&
          !(
            isDigit(characters[i - 1]?.character) &&
            isDigit(characters[i + 1]?.character)
          )
        ) {
          wordWidth = 0;
        }
      }
      maxWidth = Math.max(maxWidth, lineWidth);
    }
    return { minWidth, maxWidth, contentDensity };
  }

  computeCellConstraints(
    tnode: TNode,
    style: ViewStyle = getPaintedBlockStyle(tnode)
  ): TCellConstraints {
    const stats = this.assembleCellStats(tnode, getInitCellStats(style), style);
    const blockWidth = stats.blockWidth;
    const textConstrains = this.computeTextConstraints(stats.textStats);
    // A `max-width` on the cell itself caps the whole cell box. A descendant's
    // `max-width` must not, since it only bounds that descendant.
    const cellMaxWidth = resolveCssSize(style.maxWidth, this.contentWidth);
    // Per CSS 2.1 §17.5.2.2, "if the specified 'width' (W) of the cell is
    // greater than MCW, W is the minimum cell width", and the maximum cell
    // width is likewise raised by the column 'width'. So an explicit width
    // lifts *both* bounds — never just one, or the cell would end up
    // narrower than the width it asked for. Being a border-box width, it
    // bounds the spaced total rather than joining the content it holds.
    const cellBoxWidth = stats.cellBoxWidth ?? 0;
    const minWidth = Math.max(
      Math.max(blockWidth, textConstrains.minWidth) + stats.horizontalSpace,
      cellBoxWidth
    );
    const maxWidth = Math.max(
      Math.max(blockWidth, textConstrains.maxWidth) + stats.horizontalSpace,
      cellBoxWidth
    );
    const percentage = resolvePercentage(style.width ?? tnode.attributes.width);
    const percentWidth =
      percentage === null
        ? null
        : Math.min(
            percentage,
            resolvePercentage(style.maxWidth) ?? percentage,
            cellMaxWidth === null || this.contentWidth === 0
              ? percentage
              : cellMaxWidth / this.contentWidth
          );
    return {
      ...(percentWidth === null ? {} : { percentWidth }),
      horizontalSpace: stats.horizontalSpace,
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
