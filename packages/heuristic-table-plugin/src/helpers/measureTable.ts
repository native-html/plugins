import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import { TableGrid } from '../shared-types';
import type indexCellNeighbours from './indexCellNeighbours';
import type { DeclaredColumnWidth } from './extractColumnWidths';
import type { BorderSpacing } from './resolveBorderSpacing';
import type { TableWidths } from './resolveTableWidths';
import TCellConstraintsComputer from './TCellConstraintsComputer';
import computeColumnWidths from './computeColumnWidths';
import resolveTableStyles, { ResolvedCellStyle } from './resolveTableStyles';
import { getHorizontalInsets } from './measure';
import sum from './sum';
import { spanInternalSpacing } from './borderSpacingGeometry';

export interface MeasureTableInput {
  grid: TableGrid;
  /** The table's own source style, its writing direction folded in. */
  tableStyle: ViewStyle;
  borderCollapse: boolean;
  /**
   * Shared cell neighbours, indexed once from coordinates alone. Absent when
   * borders are not collapsing, where no cell has a shared edge to resolve.
   */
  neighbours: ReturnType<typeof indexCellNeighbours> | undefined;
  /**
   * Styles {@link HeuristicTablePluginConfig.getStyleForCell} returned, frozen
   * from a previous pass. Empty on the first pass, when no widths exist to
   * call the callback with.
   */
  configStyles: ReadonlyMap<TNode, ViewStyle | null>;
  /**
   * Shared across passes on purpose: its cache of per-cell intrinsic
   * constraints is what keeps a second pass from re-walking every text node.
   */
  computer: TCellConstraintsComputer;
  widths: TableWidths;
  borderSpacing: BorderSpacing;
  /** The border-spacing the table spends between and around its columns. */
  spacingWidth: number;
  declaredColumnWidths: Array<DeclaredColumnWidth | null>;
}

export interface MeasuredTable {
  cellStyles: ReadonlyMap<TNode, ResolvedCellStyle>;
  tableBorderStyle: ViewStyle | null;
  /** The table's own horizontal padding and border. */
  insets: number;
  columnWidths: number[];
}

/**
 * Measure every cell against the resolved styles, then size the columns.
 *
 * @remarks
 * Pure given its input: it reads the grid's coordinates and writes each cell's
 * constraints, and is safe to run twice because the second run recomputes
 * every constraint it overwrites. {@link TableLayout} runs it a second time
 * once `getStyleForCell` has been consulted, since a callback may change the
 * padding and borders the columns are measured against.
 */
export default function measureTable({
  grid,
  tableStyle,
  borderCollapse,
  neighbours,
  configStyles,
  computer,
  widths,
  borderSpacing,
  spacingWidth,
  declaredColumnWidths
}: MeasureTableInput): MeasuredTable {
  const resolved = resolveTableStyles(
    grid,
    tableStyle,
    borderCollapse,
    configStyles,
    neighbours
  );
  const insets = getHorizontalInsets({
    ...tableStyle,
    ...resolved.tableBorderStyle
  });
  // The width left for the columns, once the table's own padding, border and
  // border-spacing are taken out of the width it may occupy.
  const assignableWidth = Math.max(
    0,
    widths.usedTableWidth - insets - spacingWidth
  );
  for (const cell of grid.cells) {
    const constraints = computer.computeCellConstraints(
      cell.tnode,
      resolved.cellStyles.get(cell.tnode)!.style,
      assignableWidth
    );
    // A spanning cell also occupies the gaps between its columns.
    const internalSpacing = spanInternalSpacing(
      cell.lenX,
      borderSpacing.horizontal
    );
    cell.constraints = {
      ...constraints,
      minWidth: Math.max(0, constraints.minWidth - internalSpacing),
      maxWidth: Math.max(0, constraints.maxWidth - internalSpacing)
    };
  }
  let columnWidths = computeColumnWidths(
    { cells: grid.cells, assignableWidth, forceStretch: widths.forceStretch },
    declaredColumnWidths
  );
  // A `min-width` on the table floors the columns too, so a table told to be
  // at least this wide does not leave the surplus to its padding.
  const minLayoutWidth = Math.max(
    0,
    (widths.minWidth ?? 0) - insets - spacingWidth
  );
  if (sum(columnWidths) < minLayoutWidth) {
    const raised = computeColumnWidths(
      {
        cells: grid.cells,
        assignableWidth: minLayoutWidth,
        forceStretch: true
      },
      declaredColumnWidths
    );
    if (sum(raised) > sum(columnWidths)) columnWidths = raised;
  }
  return { ...resolved, insets, columnWidths };
}
