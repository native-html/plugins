import React, { memo, PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import TreeRenderer from './TreeRenderer';
import { HTMLTableProps } from './shared-types';
import relaxHeightConstraint from './helpers/relaxHeightConstraint';

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
  // Carry the wrapper's spare height through to the rows, including when
  // horizontal overflow requires a ScrollView. Keep the content's height floor.
  return scroll
    ? React.createElement(
        ScrollView,
        {
          contentContainerStyle: { width: tableWidth },
          style: { width: availableWidth, flexGrow: 1, flexShrink: 0 },
          horizontal: true
        },
        children
      )
    : React.createElement(
        View,
        { style: { width: tableWidth, flexGrow: 1, flexShrink: 0 } },
        children
      );
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
  const tableBorderStyle = layout.tableBorderStyle;
  return (
    <TDefaultRenderer
      {...props}
      style={{
        // An explicit height on a table is a minimum height in HTML, but only
        // `growBeyondHeight` opts into letting the table grow past it; by
        // default the declared height is enforced as written.
        ...(config.growBeyondHeight
          ? relaxHeightConstraint(props.style)
          : props.style),
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
      }}
    >
      <Container
        tableWidth={tableWidth}
        availableWidth={layout.assignableWidth}
      >
        {React.createElement(TreeRenderer, {
          node: layout.renderTree,
          borderSpacing: layout.borderSpacing,
          config,
          cellStyles: layout.cellStyles,
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
