import React from 'react';
import { HTMLTable } from '../HTMLTable';
import { render } from '@testing-library/react-native';
import WebView from 'react-native-webview';
import HTML, { ContainerProps } from 'react-native-render-html';
import { IGNORED_TAGS } from '../tags';
import table from '../table';

const simpleHTML = `
<table>
  <tr>
    <th>Entry Header 1</th>
    <th>Entry Header 2</th>
    <th>Entry Header 3</th>
  </tr>
</table>
`;

function createConfig(): Partial<ContainerProps> {
  const renderers = {
    table: table
  };
  return {
    renderers,
    ignoredTags: IGNORED_TAGS,
    WebView
  };
}

describe('integration with react-native-webview', () => {
  it('should let a HTMLTable component appear in the tree', () => {
    const { UNSAFE_getByType } = render(
      <HTML source={{ html: simpleHTML }} {...createConfig()} />
    );
    const tableTest = UNSAFE_getByType(HTMLTable);
    expect(tableTest).toBeTruthy();
    const webview = tableTest.findByType(WebView);
    expect(webview).toBeTruthy();
  });
});
