import pipe from 'ramda/src/pipe';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import max from 'ramda/src/max';
import prop from 'ramda/src/prop';
import reduce from 'ramda/src/reduce';
import { TextStyle } from 'react-native';
import { TNode } from 'react-native-render-html';
import { TBlock, TText } from '@native-html/transient-render-engine';
import { TCellConstraints } from '../shared-types';
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

export default class TCellConstraintsComputer {
  private baseFontCoeff: number;
  private fallbackFontSize: number;

  private fontWeightCoeffs: Record<
    Required<TextStyle>['fontWeight'],
    number
  > = {
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
    fallbackFontSize
  }: {
    baseFontCoeff?: number;
    fallbackFontSize?: number;
  }) {
    this.baseFontCoeff = baseFontCoeff ?? 0.65;
    this.fallbackFontSize = fallbackFontSize ?? 14;
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
    if (tnode instanceof TText) {
      const fontSize =
        tnode.styles.nativeTextFlow.fontSize ?? this.fallbackFontSize;
      const fontWeight = tnode.styles.nativeTextFlow.fontWeight ?? 'normal';
      const fontWeightCoeff = this.fontWeightCoeffs[fontWeight] ?? 1;
      stats.textStats.push({
        characters: tnode.data.length,
        maxWordLength: getMaxWordSize(tnode.data.split(/\s+/)),
        fontFamilyCoeff: 1,
        fontSize,
        fontWeightCoeff
      });
    } else {
      if (tnode instanceof TBlock) {
        const blockStyle = tnode.styles.nativeBlockRet;
        const width =
          typeof blockStyle.width === 'number'
            ? blockStyle.width
            : typeof blockStyle.minWidth === 'number'
            ? blockStyle.minWidth
            : 0;
        const margins = getHorizontalMargins(tnode.styles.nativeBlockRet);
        stats.blockWidth = Math.max(stats.blockWidth, width + margins);
      }
      tnode.children.forEach((n) => this.assembleCellStats(n, stats));
    }
    return stats;
  }

  private computeTextConstraints(chunks: TextChunkStats[]): TCellConstraints {
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
    return {
      minWidth:
        Math.max(blockWidth, textConstrains.minWidth) + stats.horizontalSpace,
      contentDensity: textConstrains.contentDensity
    };
  }
}
