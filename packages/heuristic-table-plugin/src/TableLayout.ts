import { sum } from 'ramda';
import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import computeColumnWidths from './helpers/computeColumnWidths';
import createRenderTree, { makeTableCells } from './helpers/createRenderTree';
import fillTableDisplay, {
  createEmptyDisplay
} from './helpers/fillTableDisplay';
import TCellConstraintsComputer from './helpers/TCellConstraintsComputer';
import { Display, Settings, TableCell, TableRoot } from './shared-types';
import extractColumnWidths from './helpers/extractColumnWidths';
import { clampWidth, resolveWidthConstraints } from './helpers/resolveWidth';
import resolveAvailableWidth from './helpers/resolveAvailableWidth';
import { getHorizontalInsets, getHorizontalMargins } from './helpers/measure';
import { resolveBorderCollapse } from './helpers/tableStyles';
import resolveTableStyles, {
  ResolvedCellStyle
} from './helpers/resolveTableStyles';

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
  /** Resolved once and shared by layout and cell rendering. */
  public readonly cellStyles: ReadonlyMap<TNode, ResolvedCellStyle>;
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
    // Build the grid once; styles may require a second measurement pass.
    const display = createEmptyDisplay({
      ...config,
      // A table with a specified width distributes that width over its
      // columns; shrink-to-fit only applies when the table width is auto,
      // and is opt-in.
      forceStretch
    });
    fillTableDisplay(tnode, display);
    const declaredColumnWidths = extractColumnWidths(tnode);
    const configStyles = new Map<TNode, ViewStyle | null>();
    const measure = () => {
      const resolved = resolveTableStyles(
        display,
        style,
        this.borderCollapse,
        configStyles
      );
      const insets = getHorizontalInsets({
        ...style,
        ...resolved.tableBorderStyle
      });
      display.contentWidth = Math.max(0, usedTableWidth - insets);
      const computer = new TCellConstraintsComputer({
        contentWidth: display.contentWidth,
        baseFontCoeff: config.baseFontCoeff,
        fontWeightCoeffs: config.fontWeightCoeffs
      });
      for (const cell of display.cells) {
        cell.constraints = computer.computeCellConstraints(
          cell.tnode,
          resolved.cellStyles.get(cell.tnode)!.style
        );
      }
      let columnWidths = computeColumnWidths(display, declaredColumnWidths);
      const minLayoutWidth = Math.max(0, (minWidth ?? 0) - insets);
      if (sum(columnWidths) < minLayoutWidth) {
        const raised = computeColumnWidths(
          { ...display, contentWidth: minLayoutWidth, forceStretch: true },
          declaredColumnWidths
        );
        if (sum(raised) > sum(columnWidths)) columnWidths = raised;
      }
      return { ...resolved, insets, columnWidths };
    };
    let measured = measure();
    if (config.getStyleForCell) {
      // Freeze callback results against provisional widths. Re-evaluating after
      // each resize could oscillate for a callback that branches on width.
      for (const cell of makeTableCells(display, measured.columnWidths)) {
        const configured = config.getStyleForCell.call(null, cell);
        configStyles.set(cell.tnode, configured ? { ...configured } : null);
      }
      measured = measure();
    }
    this.tableBorderStyle = measured.tableBorderStyle;
    this.cellStyles = measured.cellStyles;
    this.horizontalInsets = measured.insets;
    this.availableWidth = availableWidth;
    this.usedWidth = Math.max(0, Math.min(usedTableWidth, availableWidth));
    this.assignableWidth = Math.max(0, this.usedWidth - measured.insets);
    this.display = display;
    this.columnWidths = measured.columnWidths;
    this.totalWidth = sum(this.columnWidths);
    this.cells = makeTableCells(display, this.columnWidths);
    this.renderTree = createRenderTree(this.cells);
  }
}
