import sum from './helpers/sum';
import { totalHorizontalSpacing } from './helpers/borderSpacingGeometry';
import resolveBorderSpacing, {
  BorderSpacing
} from './helpers/resolveBorderSpacing';
import type { CellContentBox } from './CellContentWidthContext';
import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import createRenderTree, { makeTableCells } from './helpers/createRenderTree';
import buildTableGrid from './helpers/buildTableGrid';
import TCellConstraintsComputer from './helpers/TCellConstraintsComputer';
import indexCellNeighbours from './helpers/indexCellNeighbours';
import { Settings, TableCell, TableGrid, TableRoot } from './shared-types';
import extractColumnWidths from './helpers/extractColumnWidths';
import { resolveBorderCollapse } from './helpers/borderModel';
import { getSourceBlockStyle } from './helpers/cellPadding';
import type { ResolvedCellStyle } from './helpers/resolveTableStyles';
import measureTable from './helpers/measureTable';
import resolveTableWidths from './helpers/resolveTableWidths';

/** No cell style callback has run yet. */
const NO_CONFIG_STYLES: ReadonlyMap<TNode, ViewStyle | null> = new Map();

/**
 * Ask the config for a style per cell, against provisional widths.
 *
 * @remarks
 * Results are copied rather than stored by reference, so that a callback
 * handing back a shared mutable object cannot have it changed underneath the
 * second measurement pass.
 */
function collectConfigStyles(
  cells: readonly TableCell[],
  getStyleForCell: NonNullable<Settings['getStyleForCell']>
): ReadonlyMap<TNode, ViewStyle | null> {
  const configStyles = new Map<TNode, ViewStyle | null>();
  for (const cell of cells) {
    const configured = getStyleForCell(cell);
    configStyles.set(cell.tnode, configured ? { ...configured } : null);
  }
  return configStyles;
}

export default class TableLayout {
  public readonly display: TableGrid;
  public readonly borderSpacing: BorderSpacing;
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
   * The visible width of the table's content box: the narrower of
   * {@link TableLayout.availableWidth} and the table's own used width, less
   * its padding and border, which sit inside its border box.
   *
   * @remarks
   * A *viewport*, not an allowance. Columns are laid out against the width
   * left once border-spacing is also taken out, which is smaller, and which
   * for an overflowing table is smaller still than what the columns actually
   * take. Content wider than this is reached through a horizontal scroller.
   */
  public readonly viewportWidth: number;
  /**
   * The border-box width the table paints: the narrower of
   * {@link TableLayout.availableWidth} and the table's own used width.
   *
   * @remarks
   * Unlike {@link TableLayout.viewportWidth} this still holds the table's
   * padding and border, and it is a ceiling: a table whose insets alone
   * exceed it keeps this width and clips them, rather than growing past what
   * its ancestors and its own `max-width` allow.
   */
  public readonly usedWidth: number;
  /** Resolved once and shared by layout and cell rendering. */
  public readonly cellStyles: ReadonlyMap<TNode, ResolvedCellStyle>;
  public readonly cells: TableCell[];
  public readonly renderTree: TableRoot;
  constructor(tnode: TNode, config: Settings, cellContentBox?: CellContentBox) {
    const style = getSourceBlockStyle(tnode);
    this.borderCollapse = resolveBorderCollapse(tnode, config.borderCollapse);
    this.borderSpacing = resolveBorderSpacing(tnode, this.borderCollapse);
    const widths = resolveTableWidths(tnode, style, config, cellContentBox);
    // Build the grid once: coordinates and spans do not depend on any width,
    // and neighbours follow from coordinates alone.
    const grid = buildTableGrid(tnode);
    const neighbours = this.borderCollapse
      ? indexCellNeighbours(grid.cells)
      : undefined;
    const spacingWidth = grid.cells.length
      ? totalHorizontalSpacing(grid.maxX, this.borderSpacing.horizontal)
      : 0;
    // Built once and shared between passes: its cache of per-cell intrinsic
    // constraints is what keeps the second pass from re-walking every text
    // node, so constructing it per pass would silently undo that.
    const computer = new TCellConstraintsComputer({
      baseFontCoeff: config.baseFontCoeff,
      fontWeightCoeffs: config.fontWeightCoeffs
    });
    const declaredColumnWidths = extractColumnWidths(tnode);
    const pass = (configStyles: ReadonlyMap<TNode, ViewStyle | null>) =>
      measureTable({
        grid,
        tableStyle: style,
        borderCollapse: this.borderCollapse,
        neighbours,
        configStyles,
        computer,
        widths,
        borderSpacing: this.borderSpacing,
        spacingWidth,
        declaredColumnWidths
      });
    let measured = pass(NO_CONFIG_STYLES);
    if (config.getStyleForCell) {
      // The callback needs cells, which need widths, which need the styles the
      // callback returns. The cycle is broken by freezing its results against
      // the widths of a first pass: re-evaluating after each resize could
      // oscillate for a callback that branches on width.
      measured = pass(
        collectConfigStyles(
          makeTableCells(grid, measured.columnWidths, this.borderSpacing.horizontal),
          config.getStyleForCell
        )
      );
    }
    this.tableBorderStyle = measured.tableBorderStyle;
    this.cellStyles = measured.cellStyles;
    this.horizontalInsets = measured.insets;
    this.availableWidth = widths.availableWidth;
    this.usedWidth = Math.max(
      0,
      Math.min(widths.usedTableWidth, widths.availableWidth)
    );
    this.viewportWidth = Math.max(0, this.usedWidth - measured.insets);
    this.display = grid;
    this.columnWidths = measured.columnWidths;
    this.totalWidth = sum(this.columnWidths) + spacingWidth;
    this.cells = makeTableCells(
      grid,
      this.columnWidths,
      this.borderSpacing.horizontal
    );
    this.renderTree = createRenderTree(this.cells);
  }
}
