import React, { PropsWithChildren, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import TreeRenderer from './TreeRenderer';
import TableRenderContext, {
  TableRenderContextValue
} from './TableRenderContext';
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
  availableWidth,
  scrollVertically
}: PropsWithChildren<{
  tableWidth: number;
  availableWidth: number;
  scrollVertically: boolean;
}>) {
  const scroll = shouldScrollTable(tableWidth, availableWidth);
  // Carry the wrapper's spare height through to the rows, including when
  // horizontal overflow requires a ScrollView. Keep the content's height floor.
  const content = scroll
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
  // Measure rows without the viewport's height constraint. Keep the vertical
  // scroller outside the horizontal one so both axes can overflow independently.
  return scrollVertically ? (
    <ScrollView
      style={{ flexGrow: 1, flexShrink: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      nestedScrollEnabled>
      {content}
    </ScrollView>
  ) : (
    content
  );
}

/**
 * A component to render tables.
 *
 * @param props - Props from {@link useHtmlTableProps} hook.
 *
 * @remarks
 * Deliberately not wrapped in `memo`. The render engine rebuilds `style`,
 * `propsForChildren` and the container props on every render, so a shallow
 * prop comparison can never hold and the wrapper only ever costs a compare.
 * The expensive half — building the table layout — is memoized inside
 * {@link useHtmlTableProps} instead, where the inputs are stable.
 *
 * @public
 */
function HTMLTable({
  layout,
  TDefaultRenderer,
  config,
  ...props
}: HTMLTableProps) {
  const tableWidth = layout.totalWidth;
  // `layout` measures against the width the table's ancestors actually leave
  // it, which is what `contentWidth` would be if it were narrowed on the way
  // down the tree. Sizing the container off the document `contentWidth`
  // instead would spill the table out of every padded ancestor it sits in.
  const insets = layout.horizontalInsets;
  const tableBorderStyle = layout.tableBorderStyle;
  const renderContext = useMemo<TableRenderContextValue>(
    () => ({
      borderSpacing: layout.borderSpacing,
      cellStyles: layout.cellStyles,
      borderCollapse: layout.borderCollapse,
      tableBorderStyle,
      maxX: layout.display.maxX,
      maxY: layout.display.maxY,
      config
    }),
    [layout, tableBorderStyle, config]
  );
  return (
    <TDefaultRenderer
      {...props}
      style={{
        // A fixed height bounds the scroll viewport; rows keep their natural
        // height. Growing tables instead use the declared height as a minimum.
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
        width: Math.min(tableWidth + insets, layout.usedWidth),
        // Layout already applied these bounds to the table content. Reapplying
        // them in Yoga would override the capped viewport width above.
        minWidth: undefined,
        maxWidth: undefined
      }}
    >
      <Container
        tableWidth={tableWidth}
        availableWidth={layout.viewportWidth}
        scrollVertically={
          !config.growBeyondHeight &&
          props.style?.height != null &&
          props.style.height !== 'auto'
        }
      >
        <TableRenderContext.Provider value={renderContext}>
          <TreeRenderer
            node={layout.renderTree}
            renderIndex={props.renderIndex}
            renderLength={props.renderLength}
          />
        </TableRenderContext.Provider>
      </Container>
    </TDefaultRenderer>
  );
}

export default HTMLTable;
