import React, { memo, PropsWithChildren, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import TreeRenderer from './TreeRenderer';
import { HTMLTableProps } from './shared-types';
import relaxHeightConstraint from './helpers/relaxHeightConstraint';
import { getCollapsedTableBorderStyle } from './helpers/tableStyles';

export function shouldScrollTable(
  tableWidth: number,
  availableWidth: number
): boolean {
  // Browser/WebView scroll metrics are pixel-rounded. Avoid turning harmless
  // subpixel overshoots from generated values such as width:100.055% into a
  // dedicated native horizontal scroller.
  return tableWidth - availableWidth > 1;
}

function Container({
  children,
  tableWidth,
  availableWidth
}: PropsWithChildren<{
  tableWidth: number;
  availableWidth: number;
}>) {
  const scroll = shouldScrollTable(tableWidth, availableWidth);
  return scroll
    ? React.createElement(
        ScrollView,
        {
          contentContainerStyle: { width: tableWidth },
          style: { width: availableWidth },
          horizontal: true
        },
        children
      )
    : React.createElement(View, { style: { width: tableWidth } }, children);
}

/**
 * A component to render tables.
 *
 * @param props - Props from {@link useHtmlTableProps} hook.
 *
 * @public
 */
const HTMLTable = memo(function HTMLTable({
  layout,
  TDefaultRenderer,
  settings,
  config,
  ...props
}: HTMLTableProps) {
  const tableWidth = layout.totalWidth;
  // `layout` measures against the width the table's ancestors actually leave
  // it, which is what `contentWidth` would be if it were narrowed on the way
  // down the tree. Sizing the container off `settings.contentWidth` instead
  // would spill the table out of every padded ancestor it sits in.
  const insets = layout.horizontalInsets;
  const getStyleForCell = config.getStyleForCell;
  // `getStyleForCell` is handed cells the layout only produces at the end of
  // its own work, so the outer collapsed edge is narrowed once more here, now
  // that every border the edge cells actually paint is known. Leaving it to
  // the layout alone would let a border only the config declares lose to the
  // weaker one source CSS resolved, and be painted by neither. The insets the
  // layout measured against still come from source CSS: a config border
  // changes what the table paints, not how wide it was laid out.
  const tableBorderStyle = useMemo(
    () =>
      layout.borderCollapse && getStyleForCell
        ? getCollapsedTableBorderStyle(
            {
              cells: layout.cells,
              maxX: layout.display.maxX,
              maxY: layout.display.maxY
            },
            layout.tableBorderStyle ?? {},
            (cell) => ({
              ...cell.tnode.styles.nativeBlockRet,
              ...getStyleForCell(cell)
            })
          )
        : layout.tableBorderStyle,
    [getStyleForCell, layout]
  );
  return (
    <TDefaultRenderer
      {...props}
      style={{
        // An explicit height on a table is a minimum height in HTML, so that
        // the table still grows to fit its rows.
        ...relaxHeightConstraint(props.style),
        // In collapsed mode, one resolved wrapper edge represents the table
        // and all cells which meet it. Apply it after source/native styles so
        // a weaker table border cannot replace a stronger cell border.
        ...tableBorderStyle,
        // `usedWidth` already accounts for both the room the ancestors leave
        // and the table's own `width`/`max-width`, so the painted box stops at
        // whichever of the two comes first and the overflow goes to the
        // scroller inside. A table narrower than that keeps its own size,
        // insets included.
        width: Math.min(tableWidth + insets, layout.usedWidth)
      }}>
      <Container
        tableWidth={tableWidth}
        availableWidth={layout.assignableWidth}>
        {React.createElement(TreeRenderer, {
          node: layout.renderTree,
          config,
          borderCollapse: layout.borderCollapse,
          // Cells need the edge the wrapper resolved, not just their position
          // in the matrix: an outer boundary it leaves bare is still theirs.
          tableBorderStyle,
          maxX: layout.display.maxX,
          maxY: layout.display.maxY,
          renderIndex: props.renderIndex,
          renderLength: props.renderLength
        })}
      </Container>
    </TDefaultRenderer>
  );
});

export default HTMLTable;
