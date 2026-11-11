import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import type { CellContentBox } from '../CellContentWidthContext';
import { Settings } from '../shared-types';
import resolveAvailableWidth from './resolveAvailableWidth';
import { clampWidth, resolveWidthConstraints } from './resolveWidth';
import { getHorizontalMargins } from './measure';

/**
 * Tables fill the width their containing block leaves them unless the config
 * opts out, so that a table reads as part of the surrounding document rather
 * than as a shrink-wrapped island.
 */
const DEFAULT_FORCE_STRETCH = true;

/** The width envelope a table is laid out inside, before its grid is known. */
export interface TableWidths {
  /**
   * The border-box width the table may occupy, after the horizontal spacing of
   * every ancestor and the table's own margins have been subtracted from
   * {@link Settings.contentWidth}.
   */
  availableWidth: number;
  /**
   * The border-box width the table would take if nothing constrained it
   * further: its declared width when it has one, else the width on offer,
   * bounded either way by `min-width` and `max-width`.
   */
  usedTableWidth: number;
  /** The declared `min-width`, which also floors the columns. */
  minWidth: number | null;
  /** Whether the columns must fill the table width rather than shrink to fit. */
  forceStretch: boolean;
}

/**
 * Resolve how wide a table may be, independently of what is inside it.
 *
 * @remarks
 * Kept apart from measuring the grid because it needs none of it: this is the
 * envelope the ancestors and the table's own CSS allow, and the cells are
 * later fitted into whatever is left of it.
 */
export default function resolveTableWidths(
  tnode: TNode,
  style: ViewStyle,
  config: Settings,
  cellContentBox?: CellContentBox
): TableWidths {
  const containingWidth = resolveAvailableWidth(
    tnode,
    config.contentWidth,
    cellContentBox
  );
  const availableWidth = Math.max(
    0,
    containingWidth - getHorizontalMargins(style)
  );
  // Percentages resolve against the width the table may actually occupy,
  // margins already deducted, rather than against the whole containing block.
  // Resolving `width:100%` against the latter would hand the columns more
  // width than the table box is allowed — by exactly the margins — and the
  // surplus would then be shown through a horizontal scroller the same table
  // without a declared width never gets. An absolute width is untouched by
  // this and still overflows into that scroller when it does not fit.
  const { width, minWidth, maxWidth } = resolveWidthConstraints(
    tnode,
    availableWidth
  );
  const declaredTableWidth =
    width === null ? null : clampWidth(width, minWidth, maxWidth);
  return {
    availableWidth,
    // `min-width` and `max-width` bound the table width whether it is declared
    // or filled. A table that merely asks for *at least* 200px still fills the
    // width it was offered; one capped at 300px stops there rather than
    // stretching past its own ceiling.
    usedTableWidth: clampWidth(
      declaredTableWidth ?? availableWidth,
      minWidth,
      maxWidth
    ),
    minWidth,
    // A table with a specified width distributes that width over its columns;
    // shrink-to-fit only applies when the table width is auto, and is opt-in.
    forceStretch:
      (config.forceStretch ?? DEFAULT_FORCE_STRETCH) ||
      declaredTableWidth !== null
  };
}
