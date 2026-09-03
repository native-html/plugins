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

export default class TableLayout {
  public readonly display: Display;
  public readonly columnWidths: number[];
  public readonly totalWidth: number;
  public readonly renderTree: TableRoot;
  constructor(tnode: TNode, config: Settings) {
    const declaredTableWidth = resolveNodeWidth(tnode, config.contentWidth);
    const layoutContentWidth = declaredTableWidth ?? config.contentWidth;
    const layoutSettings = {
      ...config,
      contentWidth: layoutContentWidth,
      // A table with a specified width distributes that width over its columns;
      // shrink-to-fit only applies when the table width is auto.
      forceStretch: config.forceStretch || declaredTableWidth !== null
    };
    const computer = new TCellConstraintsComputer({
      contentWidth: layoutContentWidth
    });
    this.display = createEmptyDisplay(layoutSettings);
    fillTableDisplay(tnode, this.display, computer);
    const declaredColumnWidths = extractColumnWidths(tnode, layoutContentWidth);
    this.columnWidths = computeColumnWidths(
      this.display,
      declaredColumnWidths
    );
    this.totalWidth = sum(this.columnWidths);
    this.renderTree = createRenderTree(this.display, this.columnWidths);
  }
}
