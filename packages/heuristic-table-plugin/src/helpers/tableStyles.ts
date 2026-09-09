import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import { Display, DisplayCell, TableCell } from '../shared-types';

export type BorderCollapse = 'collapse' | 'separate';

export type CellVerticalAlign = 'baseline' | 'bottom' | 'middle' | 'top';

function getInlineStyleValue(
  tnode: TNode,
  propertyName: string
): string | null {
  const inlineStyle = tnode.attributes.style;
  if (!inlineStyle) {
    return null;
  }
  let value: string | null = null;
  for (const declaration of inlineStyle.split(';')) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }
    const name = declaration.slice(0, colonIndex).trim().toLowerCase();
    if (name === propertyName) {
      value = declaration
        .slice(colonIndex + 1)
        .replace(/\s*!important\s*$/i, '')
        .trim()
        .toLowerCase();
    }
  }
  return value;
}

function normalizeVerticalAlign(value: string): CellVerticalAlign | null {
  switch (value.toLowerCase()) {
    case 'top':
    case 'middle':
    case 'bottom':
    case 'baseline':
      return value.toLowerCase() as CellVerticalAlign;
    case 'initial':
    case 'unset':
      return 'baseline';
    case 'inherit':
    case 'revert':
    case 'revert-layer':
      return null;
    default:
      // Lengths, percentages and the inline-only vertical-align keywords are
      // treated as baseline for table cells by CSS.
      return 'baseline';
  }
}

/**
 * The alignment HTML's user-agent stylesheet gives a table cell.
 *
 * @remarks
 * Row groups and direct table rows are aligned to the middle, and rows and
 * cells inherit it. Being a user-agent declaration, it is outranked by any
 * author style that resolves to the same native property.
 *
 * @public
 */
export const DEFAULT_CELL_VERTICAL_ALIGN: CellVerticalAlign = 'middle';

/**
 * Resolve the vertical alignment a native table cell should emulate.
 *
 * The CSS processor intentionally drops `vertical-align` because React Native
 * cannot consume it directly, so table renderers recover the value from inline
 * CSS and the legacy `valign` attribute here.
 *
 * @returns The declared alignment, or `null` when the cell inherits nothing
 * but {@link DEFAULT_CELL_VERTICAL_ALIGN}. Callers need the distinction: the
 * default may not overwrite an author `justify-content`, whereas a declared
 * alignment must.
 */
export function resolveCellVerticalAlign(
  tnode: TNode
): CellVerticalAlign | null {
  for (
    let current: TNode | null = tnode;
    current && current.tagName !== 'table';
    current = current.parent
  ) {
    const inlineValue = getInlineStyleValue(current, 'vertical-align');
    if (inlineValue) {
      const normalized = normalizeVerticalAlign(inlineValue);
      if (normalized) {
        return normalized;
      }
    }
    const attributeValue = current.attributes.valign;
    if (attributeValue) {
      const normalized = normalizeVerticalAlign(attributeValue);
      if (normalized) {
        return normalized;
      }
    }
  }
  return null;
}

/**
 * Resolve whether a table uses the collapsing border model.
 *
 * Inline `border-collapse` is not part of React Native styles, so it must be
 * read from the source DOM. The `rules` attribute also implies collapsed
 * borders in the HTML rendering rules.
 */
export function resolveBorderCollapse(
  tnode: TNode,
  configuredValue?: BorderCollapse
): boolean {
  if (configuredValue) {
    return configuredValue === 'collapse';
  }
  const ownValue = getInlineStyleValue(tnode, 'border-collapse');
  if (ownValue === 'collapse' || ownValue === 'separate') {
    return ownValue === 'collapse';
  }
  if (tnode.attributes.rules) {
    return true;
  }
  // border-collapse is inherited. Only inline declarations are available to
  // the plugin after unsupported web-only properties have been processed.
  for (let parent = tnode.parent; parent; parent = parent.parent) {
    const inheritedValue = getInlineStyleValue(parent, 'border-collapse');
    if (inheritedValue === 'collapse' || inheritedValue === 'separate') {
      return inheritedValue === 'collapse';
    }
  }
  return false;
}

type BorderSide = 'Bottom' | 'Left' | 'Right' | 'Top';

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
  // The CSS processor always expands `border` per side, but
  // `getStyleForCell` is hand-written and the shorthand is the natural way to
  // reach for a border there, so fall back to it. An explicit per-side `0`
  // still wins, as it does in React Native.
  const width = (style[`border${side}Width`] ?? style.borderWidth) as
    | number
    | undefined;
  const color = (style[`border${side}Color`] ??
    style.borderColor) as ViewStyle['borderColor'];
  return {
    color: color ?? 'black',
    fromCell,
    style: style.borderStyle ?? 'solid',
    width: typeof width === 'number' ? width : 0
  };
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
} & Pick<Display, 'maxX' | 'maxY'>;

function cellsAtOuterEdge<C extends CollapsibleCell>(
  { cells, maxX, maxY }: CollapsibleMatrix<C>,
  side: BorderSide
): readonly C[] {
  return cells.filter((cell) => {
    switch (side) {
      case 'Top':
        return cell.y === 0;
      case 'Right':
        return cell.x + cell.lenX - 1 >= maxX;
      case 'Bottom':
        return cell.y + cell.lenY - 1 >= maxY;
      case 'Left':
        return cell.x === 0;
    }
  });
}

function sourceCellStyle(cell: CollapsibleCell): ViewStyle {
  return cell.tnode.styles.nativeBlockRet;
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
 * @param tableStyle - What the table itself brings to the conflict. Passing
 * the result of an earlier resolution narrows it further, which is how
 * {@link HeuristicTablePluginConfig.getStyleForCell} joins in once the cell
 * widths it is handed exist.
 * @param getCellStyle - Everything an edge cell paints with. Defaults to its
 * source CSS alone.
 */
export function getCollapsedTableBorderStyle<C extends CollapsibleCell>(
  matrix: CollapsibleMatrix<C>,
  tableStyle: ViewStyle,
  getCellStyle: (cell: C) => ViewStyle = sourceCellStyle
): ViewStyle {
  const resolvedStyle: ViewStyle = {};
  let strongestStyle: BorderCandidate['style'] =
    tableStyle.borderStyle ?? 'solid';
  for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
    const winner = cellsAtOuterEdge(matrix, side).reduce(
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
      borderStylePriority[winner.style] > borderStylePriority[strongestStyle]
    ) {
      strongestStyle = winner.style;
    }
  }
  resolvedStyle.borderStyle = strongestStyle;
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
  maxX: number;
  maxY: number;
  tableBorderStyle: ViewStyle | null;
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
 * Two consequences of drawing a boundary once are worth spelling out. An
 * interior boundary falls back to the opposite half of the same cell, so cells
 * carrying `border-top` alone still rule off every row: under uniform cell
 * styling — the case worth optimising for, since React Native cannot paint one
 * side of a View in two segments anyway — both halves are the same
 * declaration. And an outer boundary the wrapper resolved to nothing stays
 * with the cell, so a table that declares no border of its own still shows the
 * frame its edge cells ask for.
 *
 * `tableBorderStyle` must therefore be the edge resolved against everything
 * `cellStyle` holds, `getStyleForCell` included — otherwise a border only the
 * config declares loses to the weaker one the wrapper resolved from source CSS
 * and is painted by neither.
 */
export function getCollapsedCellBorderStyle(
  cell: Pick<TableCell, 'lenX' | 'lenY' | 'x' | 'y'>,
  cellStyle: ViewStyle,
  { maxX, maxY, tableBorderStyle }: CollapsedCellEdges
): ViewStyle {
  const resolvedStyle: ViewStyle = {};
  // A span that overruns the matrix is clipped to it rather than growing the
  // table, so it sits at the edge it overran.
  const isOuterEdge: Record<BorderSide, boolean> = {
    Top: cell.y === 0,
    Right: cell.x + cell.lenX - 1 >= maxX,
    Bottom: cell.y + cell.lenY - 1 >= maxY,
    Left: cell.x === 0
  };
  const isPaintedByTable = (side: BorderSide) => {
    const width = tableBorderStyle?.[`border${side}Width`];
    return typeof width === 'number' && width > 0;
  };
  const paint = (side: BorderSide, candidate: BorderCandidate | null) => {
    if (!candidate || candidate.width === 0) {
      Object.assign(resolvedStyle, { [`border${side}Width`]: 0 });
      return;
    }
    Object.assign(resolvedStyle, {
      [`border${side}Width`]: candidate.width,
      [`border${side}Color`]: candidate.color
    });
  };
  const ownBorder = (side: BorderSide) => borderCandidate(cellStyle, side, true);
  const keepOuterBorder = (side: BorderSide) =>
    isPaintedByTable(side) ? null : ownBorder(side);
  // A leading boundary is always drawn by the neighbour that precedes it,
  // except on the outside where there is no neighbour to draw it.
  paint('Top', isOuterEdge.Top ? keepOuterBorder('Top') : null);
  paint('Left', isOuterEdge.Left ? keepOuterBorder('Left') : null);
  for (const [side, opposite] of [
    ['Right', 'Left'],
    ['Bottom', 'Top']
  ] as const) {
    paint(
      side,
      isOuterEdge[side]
        ? keepOuterBorder(side)
        : resolveBorderConflict(ownBorder(side), ownBorder(opposite))
    );
  }
  return resolvedStyle;
}
