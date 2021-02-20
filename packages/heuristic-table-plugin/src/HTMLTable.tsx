import React from 'react';
import { ScrollView } from 'react-native';
import TreeRenderer from './TreeRenderer';
import { HTMLTableProps } from './shared-types';

/**
 * A component layout to render tables.
 *
 * @param props - Props from {@link useHtmlTableProps} hook.
 *
 * @public
 */
export default function HTMLTable({
  root: tree,
  contentWidth,
  TDefaultRenderer,
  config,
  ...props
}: HTMLTableProps) {
  return (
    <TDefaultRenderer {...props}>
      <ScrollView horizontal style={{ width: contentWidth }}>
        {React.createElement(TreeRenderer, { node: tree, config })}
      </ScrollView>
    </TDefaultRenderer>
  );
}
