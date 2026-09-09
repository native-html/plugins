import { sum } from 'ramda';
import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import computeColumnWidths from './helpers/computeColumnWidths';
import createRenderTree, { makeTableCells } from './helpers/createRenderTree';
import fillTableDisplay, {
  createEmptyDisplay,
  measureDisplay
} from './helpers/fillTableDisplay';
import TCellConstraintsComputer from './helpers/TCellConstraintsComputer';
import { Display, Settings, TableCell, TableRoot } from './shared-types';
import extractColumnWidths from './helpers/extractColumnWidths';
import { clampWidth, resolveWidthConstraints } from './helpers/resolveWidth';
import resolveAvailableWidth from './helpers/resolveAvailableWidth';
import { getHorizontalInsets, getHorizontalMargins } from './helpers/measure';
import {
  getCollapsedTableBorderStyle,
  resolveBorderCollapse
} from './helpers/tableStyles';

/**
 * Tables fill the width their containing block leaves them unless the config
 * opts out, so that a table reads as part of the surrounding document rather
 * than as a shrink-wrapped island.
 */
const DEFAULT_FORCE_STRETCH = true;

export default class TableLayout {
  public readonly display: Display;
  public readonly columnWidths: number[];
  public readonly totalWidth: number;
  public readonly borderCollapse: boolean;
  public readonly tableBorderStyle: ViewStyle | null;
  public readonly horizontalInsets: number;
  /**
   * The border-box width the table may occupy, after the horizontal spacing of
   * every ancestor and the table's own margins have been subtracted from
   * {@link Settings.contentWidth}.
   */
  public readonly availableWidth: number;
  /**
   * The width the columns may occupy: the narrower of
   * {@link TableLayout.availableWidth} and the table's own used width, less
   * its padding and border, which sit inside its border box. Columns whose
   * minimum widths overflow this are shown through a horizontal scroller.
   */
  public readonly assignableWidth: number;
  /**
   * The border-box width the table paints: the narrower of
   * {@link TableLayout.availableWidth} and the table's own used width.
   *
   * @remarks
   * Unlike {@link TableLayout.assignableWidth} this still holds the table's
   * padding and border, and it is a ceiling: a table whose insets alone
   * exceed it keeps this width and clips them, rather than growing past what
   * its ancestors and its own `max-width` allow.
   */
  public readonly usedWidth: number;
  /**
   * Every cell of the table, at the width the columns resolved to.
   *
   * @remarks
   * This is what {@link HeuristicTablePluginConfig.getStyleForCell} is called
   * with, so it is the earliest point at which the styles that function
   * contributes can take part in the collapsing border model.
   */
  public readonly cells: TableCell[];
  public readonly renderTree: TableRoot;
  constructor(tnode: TNode, config: Settings) {
    const style = tnode.styles.nativeBlockRet;
    this.borderCollapse = resolveBorderCollapse(tnode, config.borderCollapse);
    const containingWidth = resolveAvailableWidth(tnode, config.contentWidth);
    const availableWidth = Math.max(
      0,
      containingWidth - getHorizontalMargins(style)
    );
    // A percentage table width resolves against the containing block, whereas
    // the columns are laid out inside the table's own padding and border.
    const { width, minWidth, maxWidth } = resolveWidthConstraints(
      tnode,
      containingWidth
    );
    const declaredTableWidth =
      width === null ? null : clampWidth(width, minWidth, maxWidth);
    // `min-width` and `max-width` bound the table width whether it is declared
    // or filled. A table that merely asks for *at least* 200px still fills the
    // width it was offered; one capped at 300px stops there rather than
    // stretching past its own ceiling.
    const usedTableWidth = clampWidth(
      declaredTableWidth ?? availableWidth,
      minWidth,
      maxWidth
    );
    const forceStretch =
      (config.forceStretch ?? DEFAULT_FORCE_STRETCH) ||
      declaredTableWidth !== null;
    // Cell coordinates and spans do not depend on the width the table resolves
    // to; only their constraints do, and measuring text is the costly half of
    // a layout pass. Laying the grid out first lets the collapsing model
    // resolve the table's own borders — which feed the insets the cells are
    // then measured against — without a second pass over the matrix.
    const display = createEmptyDisplay({
      ...config,
      // A table with a specified width distributes that width over its
      // columns; shrink-to-fit only applies when the table width is auto,
      // and is opt-in.
      forceStretch
    });
    fillTableDisplay(tnode, display);
    this.tableBorderStyle = this.borderCollapse
      ? getCollapsedTableBorderStyle(display, style)
      : null;
    const effectiveTableStyle = this.tableBorderStyle
      ? { ...style, ...this.tableBorderStyle }
      : style;
    const insets = getHorizontalInsets(effectiveTableStyle);
    this.horizontalInsets = insets;
    this.availableWidth = availableWidth;
    // A table capped by `max-width` — or one whose declared width is narrower
    // than its content demands — offers its columns less room than its
    // ancestors leave it, and the excess has to be scrolled rather than
    // spilled out of the box the table paints.
    this.usedWidth = Math.max(0, Math.min(usedTableWidth, availableWidth));
    this.assignableWidth = Math.max(0, this.usedWidth - insets);
    const layoutContentWidth = Math.max(0, usedTableWidth - insets);
    display.contentWidth = layoutContentWidth;
    measureDisplay(
      display,
      new TCellConstraintsComputer({
        contentWidth: layoutContentWidth,
        baseFontCoeff: config.baseFontCoeff,
        fontWeightCoeffs: config.fontWeightCoeffs
      })
    );
    this.display = display;
    // Declared column widths are independent of the width they will be
    // resolved against, so the same set serves the min-width pass below.
    const declaredColumnWidths = extractColumnWidths(tnode);
    let columnWidths = computeColumnWidths(this.display, declaredColumnWidths);
    // A shrink-to-fit table may still not fall below its own `min-width`. When
    // the content lands short of that floor, the columns share the floor
    // rather than the width the content asked for.
    const minLayoutWidth = Math.max(0, (minWidth ?? 0) - insets);
    if (sum(columnWidths) < minLayoutWidth) {
      const raisedColumnWidths = computeColumnWidths(
        { ...this.display, contentWidth: minLayoutWidth, forceStretch: true },
        declaredColumnWidths
      );
      // Percentage columns resolve against whichever width the pass is given,
      // so laying out against the floor can shrink them while a capped
      // neighbour has no room left to absorb the slack. A floor may only
      // widen the table, never narrow it.
      if (sum(raisedColumnWidths) > sum(columnWidths)) {
        columnWidths = raisedColumnWidths;
      }
    }
    this.columnWidths = columnWidths;
    this.totalWidth = sum(columnWidths);
    this.cells = makeTableCells(this.display, this.columnWidths);
    this.renderTree = createRenderTree(this.cells);
  }
}
