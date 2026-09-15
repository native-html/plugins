import { ViewStyle } from 'react-native';
import { DisplayCell, TableCell, TableGrid } from '../shared-types';
import type { CellNeighbours } from './indexCellNeighbours';
import { BOX_SIDES, BoxSide, isRTL, logicalSideOf } from './boxSides';
import { getSourceBlockStyle } from './cellPadding';

type BorderSide = BoxSide;

interface BorderCandidate {
  color: ViewStyle['borderColor'];
  fromCell: boolean;
  style: NonNullable<ViewStyle['borderStyle']>;
  width: number;
}

const borderStylePriority: Record<BorderCandidate['style'], number> = {
  dotted: 0,
  dashed: 1,
  solid: 2
};

function borderCandidate(
  style: ViewStyle,
  side: BorderSide,
  fromCell: boolean
): BorderCandidate {
  const logicalSide = logicalSideOf(side, isRTL(style));
  // The CSS processor always expands `border` per side, but
  // `getStyleForCell` is hand-written and the shorthand is the natural way to
  // reach for a border there, so fall back to it. An explicit per-side `0`
  // still wins, as it does in React Native.
  const width = ((logicalSide
    ? style[`border${logicalSide}Width`]
    : undefined) ??
    style[`border${side}Width`] ??
    style.borderWidth) as number | undefined;
  const color = ((logicalSide
    ? style[`border${logicalSide}Color`]
    : undefined) ??
    style[`border${side}Color`] ??
    style.borderColor) as ViewStyle['borderColor'];
  return {
    color: color ?? 'black',
    fromCell,
    style: style.borderStyle ?? 'solid',
    width: typeof width === 'number' ? width : 0
  };
}

/** Prevent logical edges from overriding the resolved physical borders. */
function clearLogicalBorders(style: ViewStyle): ViewStyle {
  const cleared: ViewStyle = {};
  for (const key of [
    'borderStartWidth',
    'borderEndWidth',
    'borderStartColor',
    'borderEndColor'
  ] as const) {
    if (style[key] != null) Object.assign(cleared, { [key]: undefined });
  }
  return cleared;
}

function resolveBorderConflict(
  winner: BorderCandidate,
  candidate: BorderCandidate
): BorderCandidate {
  if (candidate.width !== winner.width) {
    return candidate.width > winner.width ? candidate : winner;
  }
  const candidatePriority = borderStylePriority[candidate.style];
  const winnerPriority = borderStylePriority[winner.style];
  if (candidatePriority !== winnerPriority) {
    return candidatePriority > winnerPriority ? candidate : winner;
  }
  // With otherwise equal borders, CSS gives a cell precedence over the table.
  return candidate.fromCell && !winner.fromCell ? candidate : winner;
}

/**
 * A cell as the collapsing border model sees it: where it sits in the matrix,
 * and the node its source styles come from.
 */
type CollapsibleCell = Pick<DisplayCell, 'lenX' | 'lenY' | 'tnode' | 'x' | 'y'>;

/**
 * The matrix a collapsed border is resolved over.
 *
 * @remarks
 * `maxX` and `maxY` come from the display rather than from the cells, so that
 * this agrees with {@link getCollapsedCellBorderStyle} on which cells are at
 * an edge. The two disagree for a `rowspan` that overruns the last row: the
 * table does not grow rows to fit it, so the cell is clipped and the last row
 * the display laid out stays the bottom edge.
 */
type CollapsibleMatrix<C extends CollapsibleCell> = {
  cells: readonly C[];
} & Pick<TableGrid, 'maxX' | 'maxY'>;

/**
 * Whether a cell sits against one of the table's own edges.
 *
 * @remarks
 * Shared by both collapsing passes on purpose. The wrapper resolves an outer
 * border from the cells at an edge, and each cell then decides whether that
 * same edge is its own; the two must agree, or a boundary is painted twice or
 * not at all.
 *
 * A span that overruns the matrix is clipped to it rather than growing the
 * table, so it sits at the edge it overran — hence `>=` rather than `===`.
 */
function isAtOuterEdge(
  cell: Pick<CollapsibleCell, 'lenX' | 'lenY' | 'x' | 'y'>,
  side: BorderSide,
  { maxX, maxY }: Pick<TableGrid, 'maxX' | 'maxY'>,
  rtl: boolean
): boolean {
  switch (side) {
    case 'Top':
      return cell.y === 0;
    case 'Right':
      return rtl ? cell.x === 0 : cell.x + cell.lenX - 1 >= maxX;
    case 'Bottom':
      return cell.y + cell.lenY - 1 >= maxY;
    case 'Left':
      return rtl ? cell.x + cell.lenX - 1 >= maxX : cell.x === 0;
  }
}

function cellsAtOuterEdge<C extends CollapsibleCell>(
  { cells, maxX, maxY }: CollapsibleMatrix<C>,
  side: BorderSide,
  rtl: boolean
): readonly C[] {
  return cells.filter((cell) => isAtOuterEdge(cell, side, { maxX, maxY }, rtl));
}

function sourceCellStyle(cell: CollapsibleCell): ViewStyle {
  return getSourceBlockStyle(cell.tnode);
}

/**
 * Resolve each outer collapsed border between the table and its edge cells.
 *
 * React Native cannot render different border segments along one side of a
 * View, so the strongest cell candidate is used for that complete side. This
 * still preserves the central CSS conflict rules: wider borders win, then
 * stronger styles, then cells over the table.
 *
 * @param matrix - See {@link CollapsibleMatrix}.
 * @param tableStyle - The table source style. Each pass starts from this
 * rather than a previously collapsed result, so a callback can remove a
 * source cell border as well as strengthen it.
 * @param getCellStyle - Everything an edge cell paints with. Defaults to its
 * source CSS alone.
 */
export function getCollapsedTableBorderStyle<C extends CollapsibleCell>(
  matrix: CollapsibleMatrix<C>,
  tableStyle: ViewStyle,
  getCellStyle: (cell: C) => ViewStyle = sourceCellStyle
): ViewStyle {
  const resolvedStyle: ViewStyle = clearLogicalBorders(tableStyle);
  let strongestStyle: BorderCandidate['style'] | null = null;
  for (const side of BOX_SIDES) {
    const winner = cellsAtOuterEdge(matrix, side, isRTL(tableStyle)).reduce(
      (currentWinner, cell) =>
        resolveBorderConflict(
          currentWinner,
          borderCandidate(getCellStyle(cell), side, true)
        ),
      borderCandidate(tableStyle, side, false)
    );
    Object.assign(resolvedStyle, {
      [`border${side}Width`]: winner.width,
      [`border${side}Color`]: winner.color
    });
    if (
      winner.width > 0 &&
      (strongestStyle === null ||
        borderStylePriority[winner.style] > borderStylePriority[strongestStyle])
    ) {
      strongestStyle = winner.style;
    }
  }
  resolvedStyle.borderStyle = strongestStyle ?? 'solid';
  return resolvedStyle;
}

/**
 * Which boundaries of the table a cell sits against.
 *
 * @remarks
 * `tableBorderStyle` is the wrapper edge {@link getCollapsedTableBorderStyle}
 * resolved, and is consulted rather than assumed: a side the wrapper leaves
 * bare has to stay with the cell.
 */
export interface CollapsedCellEdges {
  /** Grid direction belongs to the table, independently of cell text direction. */
  tableRTL?: boolean;
  maxX: number;
  maxY: number;
  tableBorderStyle: ViewStyle | null;
  /**
   * The cells sharing this cell's trailing and bottom boundary, from
   * {@link indexCellNeighbours}.
   *
   * @remarks
   * Absent when the caller has no matrix to index — a `td` renderer reached
   * outside this plugin's table — in which case the cell keeps its own
   * borders rather than resolving them against neighbours it cannot see.
   */
  neighbours?: CellNeighbours;
  /**
   * Everything a neighbouring cell paints with. Required alongside
   * `neighbours`, which is the only thing that consumes it.
   */
  getCellStyle?: (cell: CollapsibleCell) => ViewStyle;
}

/**
 * Draw every shared cell boundary exactly once.
 *
 * @param cell - The cell's position in the table matrix.
 * @param cellStyle - Everything the cell paints with, source CSS and
 * {@link HeuristicTablePluginConfig.getStyleForCell} alike.
 * @param edges - See {@link CollapsedCellEdges}.
 *
 * @remarks
 * Each cell owns its trailing and bottom boundary, and the table wrapper owns
 * the four outer ones it resolved against the edge cells. This mirrors the
 * visible result of the collapsing model for the border styles React Native
 * can render, without changing the flex geometry used for row and col spans.
 *
 * Shared boundaries compare the actual adjacent cells. Where spans bring
 * several neighbours against one side, the strongest candidate paints that
 * whole side; a native View cannot paint differently styled border segments.
 */
export function getCollapsedCellBorderStyle(
  cell: Pick<TableCell, 'lenX' | 'lenY' | 'x' | 'y'>,
  cellStyle: ViewStyle,
  {
    maxX,
    maxY,
    tableBorderStyle,
    neighbours,
    getCellStyle,
    tableRTL: rtl = isRTL(cellStyle)
  }: CollapsedCellEdges
): ViewStyle {
  const resolvedStyle: ViewStyle = clearLogicalBorders(cellStyle);
  const isOuterEdge = (side: BorderSide) =>
    isAtOuterEdge(cell, side, { maxX, maxY }, rtl);
  const isPaintedByTable = (side: BorderSide) => {
    const width = tableBorderStyle?.[`border${side}Width`];
    return typeof width === 'number' && width > 0;
  };
  let strongestStyle: BorderCandidate['style'] | null = null;
  const paint = (side: BorderSide, candidate: BorderCandidate | null) => {
    if (!candidate || candidate.width === 0) {
      Object.assign(resolvedStyle, { [`border${side}Width`]: 0 });
      return;
    }
    if (
      strongestStyle === null ||
      borderStylePriority[candidate.style] > borderStylePriority[strongestStyle]
    ) {
      strongestStyle = candidate.style;
    }
    Object.assign(resolvedStyle, {
      [`border${side}Width`]: candidate.width,
      [`border${side}Color`]: candidate.color
    });
  };
  const ownBorder = (side: BorderSide) =>
    borderCandidate(cellStyle, side, true);
  const keepOuterBorder = (side: BorderSide) =>
    isPaintedByTable(side) ? null : ownBorder(side);
  // A leading boundary is always drawn by the neighbour that precedes it,
  // except on the outside where there is no neighbour to draw it.
  paint('Top', isOuterEdge('Top') ? keepOuterBorder('Top') : null);
  const start = rtl ? 'Right' : 'Left';
  const end = rtl ? 'Left' : 'Right';
  paint(start, isOuterEdge(start) ? keepOuterBorder(start) : null);
  for (const [side, opposite, neighbourEdge] of [
    [end, start, 'End'],
    ['Bottom', 'Top', 'Bottom']
  ] as const) {
    paint(
      side,
      isOuterEdge(side)
        ? keepOuterBorder(side)
        : (neighbours?.[neighbourEdge] ?? []).reduce(
            (winner, neighbour) =>
              resolveBorderConflict(
                winner,
                borderCandidate(
                  (getCellStyle ?? sourceCellStyle)(neighbour),
                  opposite,
                  true
                )
              ),
            ownBorder(side)
          )
    );
  }
  if (strongestStyle !== null) resolvedStyle.borderStyle = strongestStyle;
  return resolvedStyle;
}

