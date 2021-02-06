import React from 'react';
import { HTMLTable } from '../HTMLTable';
import { render } from '@testing-library/react-native';
import WebView from 'react-native-webview';
import HTML, { RenderHTMLProps } from 'react-native-render-html';
import TableRenderer from '../TableRenderer';

const simpleHTML = `
<table>
  <tr>
    <th>Entry Header 1</th>
    <th>Entry Header 2</th>
    <th>Entry Header 3</th>
  </tr>
</table>
`;

function createConfig(): Partial<RenderHTMLProps> {
  const renderers = {
    table: TableRenderer
  };
  return {
    renderers,
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
