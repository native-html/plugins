import { ViewStyle } from 'react-native';
import {
  CustomRendererProps,
  PropsFromParent,
  TBlock,
  TNode
} from '@native-html/render';
import TableLayout from './TableLayout';
import type { FontWeightCoefficients } from './helpers/TCellConstraintsComputer';

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
   * The width beyond which this column would gain nothing — the *maximum
   * column width* of {@link https://www.w3.org/TR/CSS21/tables.html#auto-table-layout | CSS 2.1 §17.5.2.2}.
   *
   * @remarks
   * This is the greatest {@link TCellConstraints.maxWidth} among the cells of
   * the column, and is always at least {@link TConstraintsBase.minWidth}:
   * per the spec, both bounds are raised by the column `width`, so a maximum
   * can never sit below its own minimum.
   *
   * Note that spread and contentDensity only differ when applied to a whole
   * column: the column content density is the *sum* of the cell content
   * densities, whereas spread is a maximum.
   */
  spread: number;
}

/**
 * @public
 */
export interface TCellConstraints extends TConstraintsBase {
  /** Preferred fraction of the table width, resolved during distribution. */
  percentWidth?: number;
  /**
   * The width at which this cell would stop benefiting from more space — the
   * *maximum cell width* of {@link https://www.w3.org/TR/CSS21/tables.html#auto-table-layout | CSS 2.1 §17.5.2.2},
   * including horizontal spacing.
   *
   * @remarks
   * Like {@link TConstraintsBase.minWidth}, this is raised by an explicit
   * `width` on the cell, so it is never below `minWidth`.
   */
  maxWidth: number;
}

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
  getStyleForCell?: HeuristicTablePluginConfig['getStyleForCell'];
  /**
   * When true, force the table to stretch to the available width.
   */
  forceStretch?: boolean;
  /**
   * The average advance width of one character, as a fraction of the font
   * size, used to estimate how wide a cell's text is.
   *
   * @remarks
   * Text is never measured, only estimated: a cell's bounds are its character
   * count times this coefficient times the font size. Raise it when tables
   * come out too narrow and their text wraps more than it should, lower it
   * when cells claim more width than their content occupies.
   *
   * @defaultValue 0.65
   */
  baseFontCoeff?: number;
  /**
   * How much wider text renders at a given font weight than at a regular one,
   * keyed by the stringified `fontWeight`.
   *
   * @remarks
   * Merged over the defaults rather than replacing them, so `{ bold: 1.05 }`
   * retunes bold text alone and leaves the numeric weights as they were. A
   * weight with no entry, before or after merging, costs nothing. Pass a
   * referentially stable object — a fresh literal on every render relays out
   * every table using it.
   *
   * @defaultValue \{ normal: 1, bold: 1.3, '100': 0.8 … '900': 1.5 \}
   */
  fontWeightCoeffs?: FontWeightCoefficients;
  /**
   * Override the table's `border-collapse` mode.
   */
  borderCollapse?: 'collapse' | 'separate';
  /**
   * Available width at the root of the render tree, prior to scrolling.
   *
   * @remarks
   * This is the width offered to the document as a whole. The horizontal
   * spacing of the table's ancestors, and of the table itself, is subtracted
   * from it by {@link TableLayout}.
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
   * When true, the table stretches to fill the width its containing block
   * offers — `contentWidth`, less the horizontal spacing of every ancestor.
   * When false, a table with an auto width shrinks to fit its content.
   *
   * @defaultValue true
   */
  forceStretch?: boolean;
  /**
   * The average advance width of one character, as a fraction of the font
   * size, used to estimate how wide a cell's text is.
   *
   * @remarks
   * Text is never measured, only estimated: a cell's bounds are its character
   * count times this coefficient times the font size. Raise it when tables
   * come out too narrow and their text wraps more than it should, lower it
   * when cells claim more width than their content occupies.
   *
   * @defaultValue 0.65
   */
  baseFontCoeff?: number;
  /**
   * How much wider text renders at a given font weight than at a regular one,
   * keyed by the stringified `fontWeight`.
   *
   * @remarks
   * Merged over the defaults rather than replacing them, so `{ bold: 1.05 }`
   * retunes bold text alone and leaves the numeric weights as they were. A
   * weight with no entry, before or after merging, costs nothing. Pass a
   * referentially stable object — a fresh literal on every render relays out
   * every table using it.
   *
   * @defaultValue \{ normal: 1, bold: 1.3, '100': 0.8 … '900': 1.5 \}
   */
  fontWeightCoeffs?: FontWeightCoefficients;
  /**
   * Override the table's border model. When omitted, an inline
   * `border-collapse` declaration from the table is used.
   *
   * @defaultValue `separate`
   */
  borderCollapse?: 'collapse' | 'separate';
  /**
   * When true, an explicit `height` on the table, or on any of its cells, is
   * treated as a minimum: the box still grows to fit content taller than it.
   * When false, that `height` is enforced as written and taller content
   * overflows it.
   *
   * @remarks
   * Per {@link https://www.w3.org/TR/CSS21/tables.html#height-layout | CSS 2.1
   * §17.5.3}, `height` on a `table`, `tr`, `th` or `td` box is only a minimum,
   * so `true` is the faithful reading of the HTML. It is off by default
   * because React Native has no table layout algorithm to shrink a row back
   * down, and a document whose markup sizes its tables is better served by a
   * box that stays the size it asked for.
   *
   * @defaultValue false
   */
  growBeyondHeight?: boolean;
  /**
   * Customize cells appearance with this function.
   *
   * Called once per cell per layout, with provisional widths measured from
   * source styles. Returned styles are saved, included in the final layout,
   * and reused for rendering. Width-dependent callbacks are not iterated.
   * Keep this function referentially stable to avoid unnecessary layouts.
   *
   * @param cell - The cell with its provisional width and constraints.
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
