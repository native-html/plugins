import { TNode } from '@native-html/render';
import { ViewStyle } from 'react-native';
import { Display } from '../shared-types';
import {
  getCollapsedCellBorderStyle,
  getCollapsedTableBorderStyle,
  resolveConfiguredCellStyle
} from './tableStyles';
import composeCellStyle from './composeCellStyle';
import indexCellNeighbours from './indexCellNeighbours';

/** One saved style resolution shared by measurement and rendering. */
export interface ResolvedCellStyle {
  configStyle: ViewStyle | null;
  borderStyle: ViewStyle | null;
  style: ViewStyle;
}

export default function resolveTableStyles(
  display: Display,
  tableStyle: ViewStyle,
  collapse: boolean,
  configStyles: ReadonlyMap<TNode, ViewStyle | null>,
  neighbours = collapse ? indexCellNeighbours(display.cells) : undefined
) {
  const styles = new Map<TNode, ViewStyle>();
  const configuredStyles = new Map<TNode, ViewStyle | null>();
  for (const { tnode } of display.cells) {
    const source = tnode.styles.nativeBlockRet;
    const configured = resolveConfiguredCellStyle(configStyles.get(tnode));
    configuredStyles.set(tnode, configured);
    styles.set(tnode, composeCellStyle(source, configured));
  }
  const getCellStyle = ({ tnode }: { tnode: TNode }) => styles.get(tnode)!;
  const tableBorderStyle = collapse
    ? getCollapsedTableBorderStyle(display, tableStyle, getCellStyle)
    : null;
  const cellStyles = new Map<TNode, ResolvedCellStyle>();
  for (const cell of display.cells) {
    const borderStyle = collapse
      ? getCollapsedCellBorderStyle(cell, getCellStyle(cell), {
          ...display,
          tableBorderStyle,
          getCellStyle,
          neighbours: neighbours?.get(cell)
        })
      : null;
    cellStyles.set(cell.tnode, {
      configStyle: configuredStyles.get(cell.tnode)!,
      borderStyle,
      style: { ...getCellStyle(cell), ...borderStyle }
    });
  }
  return { tableBorderStyle, cellStyles };
}
