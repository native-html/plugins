import React, { memo, PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import TreeRenderer from './TreeRenderer';
import { HTMLTableProps } from './shared-types';
import { getHorizontalSpacing } from './helpers/measure';
import relaxHeightConstraint from './helpers/relaxHeightConstraint';

function Container({
  children,
  tableWidth,
  availableWidth
}: PropsWithChildren<{
  tableWidth: number;
  availableWidth: number;
}>) {
  const scroll = tableWidth > availableWidth;
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
  const containerWidth = settings.contentWidth;
  return (
    <TDefaultRenderer
      {...props}
      style={{
        // An explicit height on a table is a minimum height in HTML, so that
        // the table still grows to fit its rows.
        ...relaxHeightConstraint(props.style),
        width: Math.min(
          tableWidth + getHorizontalSpacing(props.tnode.styles.nativeBlockRet),
          containerWidth
        )
      }}>
      <Container tableWidth={tableWidth} availableWidth={containerWidth}>
        {React.createElement(TreeRenderer, {
          node: layout.renderTree,
          config,
          renderIndex: props.renderIndex,
          renderLength: props.renderLength
        })}
      </Container>
    </TDefaultRenderer>
  );
});

export default HTMLTable;
