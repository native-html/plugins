import { ViewStyle } from 'react-native';
import { TNode } from 'react-native-render-html';

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
 */
export interface FlexRowContainer {
  type: 'row-container';
  children: (FlexColumnContainer | TableCell)[];
}

/**
 * A container to display items in columns
 * (think 'flex-dierection: column')
 */
export interface FlexColumnContainer {
  type: 'col-container';
  children: (FlexRowContainer | TableCell)[];
}

export interface Root {
  type: 'root';
  children: FlexRowContainer[];
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

export type RenderNode =
  | TableCell
  | FlexColumnContainer
  | FlexRowContainer
  | Root;

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
