import { TNode } from '@native-html/render';
import { ViewStyle } from 'react-native';
import { TableGrid } from '../shared-types';
import { getSourceBlockStyle, resolveConfiguredCellStyle } from './cellPadding';
import { getCollapsedCellBorderStyle, getCollapsedTableBorderStyle } from './collapseBorders';
import composeCellStyle from './cellPadding';
import indexCellNeighbours from './indexCellNeighbours';

/** One saved style resolution shared by measurement and rendering. */
export interface ResolvedCellStyle {
  configStyle: ViewStyle | null;
  borderStyle: ViewStyle | null;
  style: ViewStyle;
}

export default function resolveTableStyles(
  grid: TableGrid,
  tableStyle: ViewStyle,
  collapse: boolean,
  configStyles: ReadonlyMap<TNode, ViewStyle | null>,
  // Required: `TableLayout` indexes once per layout and passes it to both
  // measurement passes, so a default here would be a second place stating the
  // "index only when collapsing" rule, and would never run.
  neighbours: ReturnType<typeof indexCellNeighbours> | undefined
) {
  const styles = new Map<TNode, ViewStyle>();
  const configuredStyles = new Map<TNode, ViewStyle | null>();
  for (const { tnode } of grid.cells) {
    const source = getSourceBlockStyle(tnode);
    const configured = resolveConfiguredCellStyle(configStyles.get(tnode));
    configuredStyles.set(tnode, configured);
    styles.set(tnode, composeCellStyle(source, configured));
  }
  const getCellStyle = ({ tnode }: { tnode: TNode }) => styles.get(tnode)!;
  const tableBorderStyle = collapse
    ? getCollapsedTableBorderStyle(grid, tableStyle, getCellStyle)
    : null;
  const cellStyles = new Map<TNode, ResolvedCellStyle>();
  for (const cell of grid.cells) {
    const borderStyle = collapse
      ? getCollapsedCellBorderStyle(cell, getCellStyle(cell), {
          maxX: grid.maxX,
          maxY: grid.maxY,
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
