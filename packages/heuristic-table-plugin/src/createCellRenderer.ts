import React from 'react';
import { CustomBlockRenderer } from '@native-html/render';
import useHtmlTableCellProps from './useHtmlTableCellProps';

/**
 * Build the renderer for a table cell tag.
 *
 * @remarks
 * `td` and `th` render identically — the difference between them is carried by
 * the user-agent styles the engine has already resolved, not by anything this
 * plugin does. They are built from one implementation so the two cannot drift,
 * and keep separate names so React devtools still tells them apart.
 */
export default function createCellRenderer(
  tagName: 'td' | 'th'
): CustomBlockRenderer {
  const displayName = `${tagName === 'td' ? 'Td' : 'Th'}Renderer`;
  const renderer: CustomBlockRenderer = function CellRenderer(props) {
    return React.createElement(
      props.TDefaultRenderer,
      useHtmlTableCellProps(props)
    );
  };
  Object.defineProperty(renderer, 'name', { value: displayName });
  (renderer as { displayName?: string }).displayName = displayName;
  return renderer;
}
