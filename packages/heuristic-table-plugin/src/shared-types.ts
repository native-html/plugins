import { ViewStyle } from 'react-native';
import {
  CustomRendererProps,
  PropsFromParent,
  TBlock,
  TNode
} from 'react-native-render-html';
import TableLayout from './TableLayout';

/**
 * @public
 */
export interface Coordinates {
  x: number;
  y: number;
}

/**
 * @public
 */
export interface TConstraintsBase {
  /**
   * The minimum width for this text.
   */
  minWidth: number;
  /**
   * The total textual density for one column (or cell).
   */
  contentDensity: number;
}

/**
 * @public
 */
export interface TColumnConstraints extends TConstraintsBase {
  /**
   * The minimum number for the text in one column to hold in one line.
   *
   * @remarks spread and contentDensity only differ when applied to a
   * whole column. Spread width will be the maximum of cell content densities,
   * while the column content density will be the sum of the cell content
   * densities.
   */
  spread: number;
}

/**
 * @public
 */
export interface TCellConstraints extends TConstraintsBase {}

/**
 * @public
 */
export interface CellProperties extends Coordinates {
  lenX: number;
  lenY: number;
  constraints: TCellConstraints;
}

/**
 * @public
 */
export interface DisplayCell extends CellProperties {
  tnode: TNode;
}

/**
 * A container to display items in row.
 * (think 'flex-direction: row')
 *
 * @public
 */
export interface TableFlexRowContainer {
  type: 'row-container';
  children: (TableFlexColumnContainer | TableCell)[];
}

/**
 * A container to display items in columns
 * (think 'flex-direction: column')
 *
 * @public
 */
export interface TableFlexColumnContainer {
  type: 'col-container';
  children: (TableFlexRowContainer | TableCell)[];
}

/**
 * @public
 */
export interface TableRoot {
  type: 'root';
  children: TableFlexRowContainer[];
}

/**
 * A cell is a unit of display for one `th` or `td` in a table, with
 * coordinates and lengths relative to the matrix (rows, columns) coordinate
 * system.
 *
 * <pre>
 * 0 1 2 → x
 * 1 . .
 * 2 . .
 * ↓ y
 * </pre>
 *
 * @remarks
 *
 * @public
 */
export interface TableCell extends DisplayCell {
  type: 'cell';
  width: number;
}

export type TableRenderNode =
  | TableCell
  | TableFlexColumnContainer
  | TableFlexRowContainer
  | TableRoot;

export interface Settings {
  /**
   * When true, force the table to stretch to the available width.
   */
  forceStretch?: boolean;
  /**
   * Available width prior to scrolling.
   */
  contentWidth: number;
}

export interface Display extends Settings {
  maxY: number;
  maxX: number;
  occupiedCoordinates: Array<Coordinates>;
  offsetX: number;
  cells: DisplayCell[];
}

/**
 * Options to customize this plugin renderers.
 *
 * @public
 */
export interface HeuristicTablePluginConfig {
  /**
   * When true, force the table to stretch to the available width.
   */
  forceStretch?: boolean;
  /**
   * Customize cells appearance with this function.
   *
   * @param cell - The cell for which styles should be provided.
   */
  getStyleForCell?(cell: TableCell): ViewStyle | null;
}

/**
 * Props for the {@link HTMLTable} component.
 *
 * @public
 */
export interface HTMLTableProps extends CustomRendererProps<TBlock> {
  layout: TableLayout;
  config: HeuristicTablePluginConfig;
  settings: Settings;
}

/**
 * Props received by td and th custom renderers in `propsFromParent` prop
 * field.
 *
 * @public
 */
export interface TableCellPropsFromParent extends PropsFromParent {
  config?: HeuristicTablePluginConfig;
  cell: TableCell;
}
