import React from 'react';
import { HTMLTable } from '../HTMLTable';
import { render } from '@testing-library/react-native';
import WebView from 'react-native-webview';
import HTML, { ContainerProps } from 'react-native-render-html';
import { makeTableRenderer } from '../make-table-renderer';
import { alterNode } from '../alter-node';
import { IGNORED_TAGS } from '../tags';
import { TableConfig } from '../types';

const simpleHTML = `
<table>
  <tr>
    <th>Entry Header 1</th>
    <th>Entry Header 2</th>
    <th>Entry Header 3</th>
  </tr>
</table>
`;

function createConfig(
  extraneousConfig: Partial<TableConfig> = {}
): Partial<ContainerProps> {
  const renderers = {
    table: makeTableRenderer({
      WebView,
      animationType: 'none',
      ...extraneousConfig
    })
  };
  return {
    alterNode,
    renderers,
    ignoredTags: IGNORED_TAGS
  };
}

describe('integration with react-native-webview', () => {
  it('should let a HTMLTable component appear in the tree', () => {
    const { UNSAFE_getByType } = render(
      <HTML html={simpleHTML} {...createConfig()} />
    );
    const table = UNSAFE_getByType(HTMLTable);
    expect(table).toBeTruthy();
    const webview = table.findByType(WebView);
    expect(webview).toBeTruthy();
  });
});
