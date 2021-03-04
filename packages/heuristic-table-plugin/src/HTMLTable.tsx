import React, { memo, PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import TreeRenderer from './TreeRenderer';
import { HTMLTableProps } from './shared-types';
import { getHorizontalSpacing } from './helpers/measure';

function Container({
  children,
  tableWidth,
  availableWidth
}: PropsWithChildren<{
  tableWidth: number;
  availableWidth: number;
}>) {
  const scroll = tableWidth > availableWidth;
  return React.createElement(
    scroll ? ScrollView : View,
    scroll
      ? {
          contentContainerStyle: { width: tableWidth },
          style: { width: availableWidth },
          horizontal: true
        }
      : { style: { width: tableWidth } },
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
  const containerWidth = settings.contentWidth;
  return (
    <TDefaultRenderer
      {...props}
      style={{
        ...props.style,
        width: Math.min(
          tableWidth + getHorizontalSpacing(props.tnode.styles.nativeBlockRet),
          containerWidth
        )
      }}>
      <Container tableWidth={tableWidth} availableWidth={containerWidth}>
        {React.createElement(TreeRenderer, {
          node: layout.renderTree,
          config,
          rootMarkers: props.markers
        })}
      </Container>
    </TDefaultRenderer>
  );
});

export default HTMLTable;
