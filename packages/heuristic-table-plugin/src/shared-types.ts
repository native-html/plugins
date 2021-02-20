import { ViewStyle } from 'react-native';
import {
  CustomTagRendererProps,
  PropsFromParent,
  TBlock,
  TNode
} from 'react-native-render-html';

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
export interface CellProperties extends Coordinates {
  lenX: number;
  lenY: number;
  weight: number;
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
 * (think 'flex-dierection: column')
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

export interface Display {
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
export interface HTMLTableProps extends CustomTagRendererProps<TBlock> {
  root: TableRoot;
  contentWidth: number;
  config: HeuristicTablePluginConfig;
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
