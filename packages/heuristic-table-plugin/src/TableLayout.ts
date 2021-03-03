import { sum } from 'ramda';
import { TNode } from 'react-native-render-html';
import computeColumnWidths from './helpers/computeColumnWidths';
import createRenderTree from './helpers/createRenderTree';
import fillTableDisplay, {
  createEmptyDisplay
} from './helpers/fillTableDisplay';
import TCellConstraintsComputer from './helpers/TCellConstraintsComputer';
import { Display, Settings, TableRoot } from './shared-types';

export default class TableLayout {
  public readonly display: Display;
  public readonly columnWidths: number[];
  public readonly totalWidth: number;
  public readonly renderTree: TableRoot;
  constructor(tnode: TNode, config: Settings) {
    const computer = new TCellConstraintsComputer({});
    this.display = createEmptyDisplay(config);
    fillTableDisplay(tnode, this.display, computer);
    this.columnWidths = computeColumnWidths(this.display);
    this.totalWidth = sum(this.columnWidths);
    this.renderTree = createRenderTree(this.display, this.columnWidths);
  }
}
