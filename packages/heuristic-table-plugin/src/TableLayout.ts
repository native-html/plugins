import { sum } from 'ramda';
import { TNode } from '@native-html/render';
import computeColumnWidths from './helpers/computeColumnWidths';
import createRenderTree from './helpers/createRenderTree';
import fillTableDisplay, {
  createEmptyDisplay
} from './helpers/fillTableDisplay';
import TCellConstraintsComputer from './helpers/TCellConstraintsComputer';
import { Display, Settings, TableRoot } from './shared-types';
import extractColumnWidths from './helpers/extractColumnWidths';
import { resolveNodeWidth } from './helpers/resolveWidth';
import resolveAvailableWidth from './helpers/resolveAvailableWidth';
import { getHorizontalInsets, getHorizontalMargins } from './helpers/measure';

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
  /**
   * The border-box width the table may occupy, after the horizontal spacing of
   * every ancestor and the table's own margins have been subtracted from
   * {@link Settings.contentWidth}.
   */
  public readonly availableWidth: number;
  /**
   * The width the columns may occupy: {@link TableLayout.availableWidth} less
   * the table's own padding and border, which sit inside its border box.
   */
  public readonly assignableWidth: number;
  public readonly renderTree: TableRoot;
  constructor(tnode: TNode, config: Settings) {
    const style = tnode.styles.nativeBlockRet;
    const containingWidth = resolveAvailableWidth(tnode, config.contentWidth);
    const insets = getHorizontalInsets(style);
    const availableWidth = Math.max(
      0,
      containingWidth - getHorizontalMargins(style)
    );
    // A percentage table width resolves against the containing block, whereas
    // the columns are laid out inside the table's own padding and border.
    const declaredTableWidth = resolveNodeWidth(tnode, containingWidth);
    this.availableWidth = availableWidth;
    this.assignableWidth = Math.max(0, availableWidth - insets);
    const layoutContentWidth = Math.max(
      0,
      (declaredTableWidth ?? availableWidth) - insets
    );
    const layoutSettings = {
      ...config,
      contentWidth: layoutContentWidth,
      // A table with a specified width distributes that width over its columns;
      // shrink-to-fit only applies when the table width is auto, and is opt-in.
      forceStretch:
        (config.forceStretch ?? DEFAULT_FORCE_STRETCH) ||
        declaredTableWidth !== null
    };
    const computer = new TCellConstraintsComputer({
      contentWidth: layoutContentWidth
    });
    this.display = createEmptyDisplay(layoutSettings);
    fillTableDisplay(tnode, this.display, computer);
    const declaredColumnWidths = extractColumnWidths(tnode, layoutContentWidth);
    this.columnWidths = computeColumnWidths(this.display, declaredColumnWidths);
    this.totalWidth = sum(this.columnWidths);
    this.renderTree = createRenderTree(this.display, this.columnWidths);
  }
}
