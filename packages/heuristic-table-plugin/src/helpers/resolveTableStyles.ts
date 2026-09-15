import { TNode } from '@native-html/render';
import { ViewStyle } from 'react-native';
import { Display } from '../shared-types';
import {
  getCollapsedCellBorderStyle,
  getCollapsedTableBorderStyle,
  getDefaultCellPaddingStyle,
  resolveConfiguredCellStyle
} from './tableStyles';

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
  configStyles: ReadonlyMap<TNode, ViewStyle | null>
) {
  const styles = new Map<TNode, ViewStyle>();
  for (const { tnode } of display.cells) {
    const source = tnode.styles.nativeBlockRet;
    const configured = resolveConfiguredCellStyle(configStyles.get(tnode));
    styles.set(tnode, {
      ...getDefaultCellPaddingStyle(source, configured),
      ...source,
      ...configured
    });
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
          getCellStyle
        })
      : null;
    cellStyles.set(cell.tnode, {
      configStyle: resolveConfiguredCellStyle(configStyles.get(cell.tnode)),
      borderStyle,
      style: { ...getCellStyle(cell), ...borderStyle }
    });
  }
  return { tableBorderStyle, cellStyles };
}
