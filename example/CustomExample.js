import React from 'react';
import RenderHTML from 'react-native-render-html';
import { useHtmlTableProps, tableModel } from '@native-html/table-plugin';
import ClickTable from './ClickTable';
import WebView from 'react-native-webview';

const table1 = `

This custom component will adapt it's layout depending on table stats.
If the table has less than 4 columns and 8 rows, or less than 400 printable characters, it will be shown inline.
Otherwise, a button will be displayed to open a modal.

<h2>Small table</h2>

<table>
  <tr>
    <th>Entry Header 1</th>
    <th>Entry Header 2</th>
    <th>Entry Header 3</th>
  </tr>
  <tr>
    <td>Entry First Line 1</td>
    <td>Entry First Line 2</td>
    <td>Entry First Line 3</td>
  </tr>
  <tr>
    <td>Entry Second Line 1</td>
    <td>Entry Second Line 2</td>
    <td>Entry Second Line 3</td>
  </tr>
  <tr>
    <td>Entry Third Line 1</td>
    <td>Entry Third Line 2</td>
    <td>Entry Third Line 3</td>
  </tr>
</table>

<h2>Big table</h2>

<table>
  <tr>
    <th>Company</th>
    <th>Contact</th>
    <th>Country</th>
  </tr>
  <tr>
    <td>Alfreds Futterkiste website</td>
    <td>Maria Anders</td>
    <td><a class="a" href="https://en.wikipedia.org/wiki/germany">Germany</a></td>
  </tr>
  <tr>
    <td>Centro comercial Moctezuma</td>
    <td>Francisco Chang</td>
    <td><a href="https://en.wikipedia.org/wiki/mexico">Mexico</a></td>
  </tr>
  <tr>
    <td>Ernst Handel</td>
    <td>Roland Mendel</td>
    <td><a href="https://en.wikipedia.org/wiki/austria">Austria</a></td>
  </tr>
  <tr>
    <td>Island Trading</td>
    <td>Helen Bennett</td>
    <td><a href="https://en.wikipedia.org/wiki/united_kingdom">UK</td>
  </tr>
  <tr>
    <td>Laughing Bacchus Winecellars</td>
    <td>Yoshi Tannamuri</td>
    <td><a href="https://en.wikipedia.org/wiki/canada">Canada</a></td>
  </tr>
  <tr>
    <td>Magazzini Alimentari Riuniti</td>
    <td>Giovanni Rovelli</td>
    <td><a href="https://en.wikipedia.org/wiki/italy">Italy</a></td>
  </tr>
  <tr>
    <td>Alfreds Futterkiste website</td>
    <td>Maria Anders</td>
    <td><a href="https://en.wikipedia.org/wiki/germany">Germany</a></td>
  </tr>
  <tr>
    <td>Centro comercial Moctezuma</td>
    <td>Francisco Chang</td>
    <td><a href="https://en.wikipedia.org/wiki/mexico">Mexico</a></td>
  </tr>
  <tr>
    <td>Ernst Handel</td>
    <td>Roland Mendel</td>
    <td><a href="https://en.wikipedia.org/wiki/austria">Austria</a></td>
  </tr>
  <tr>
    <td>Island Trading</td>
    <td>Helen Bennett</td>
    <td><a href="https://en.wikipedia.org/wiki/united_kingdom">UK</td>
  </tr>
  <tr>
    <td>Laughing Bacchus Winecellars</td>
    <td>Yoshi Tannamuri</td>
    <td><a href="https://en.wikipedia.org/wiki/canada">Canada</a></td>
  </tr>
  <tr>
    <td>Magazzini Alimentari Riuniti</td>
    <td>Giovanni Rovelli</td>
    <td><a href="https://en.wikipedia.org/wiki/italy">Italy</a></td>
  </tr>
    <tr>
    <td>Alfreds Futterkiste website</td>
    <td>Maria Anders</td>
    <td><a href="https://en.wikipedia.org/wiki/germany">Germany</a></td>
  </tr>
  <tr>
    <td>Centro comercial Moctezuma</td>
    <td>Francisco Chang</td>
    <td><a href="https://en.wikipedia.org/wiki/mexico">Mexico</a></td>
  </tr>
  <tr>
    <td>Ernst Handel</td>
    <td>Roland Mendel</td>
    <td><a href="https://en.wikipedia.org/wiki/austria">Austria</a></td>
  </tr>
  <tr>
    <td>Island Trading</td>
    <td>Helen Bennett</td>
    <td><a href="https://en.wikipedia.org/wiki/united_kingdom">UK</td>
  </tr>
  <tr>
    <td>Laughing Bacchus Winecellars</td>
    <td>Yoshi Tannamuri</td>
    <td><a href="https://en.wikipedia.org/wiki/canada">Canada</a></td>
  </tr>
  <tr>
    <td>Magazzini Alimentari Riuniti</td>
    <td>Giovanni Rovelli</td>
    <td><a href="https://en.wikipedia.org/wiki/italy">Italy</a></td>
  </tr>
  <tr>
    <td>Island Trading</td>
    <td>Helen Bennett</td>
    <td><a href="https://en.wikipedia.org/wiki/united_kingdom">UK</td>
  </tr>
  <tr>
    <td>Laughing Bacchus Winecellars</td>
    <td>Yoshi Tannamuri</td>
    <td><a href="https://en.wikipedia.org/wiki/canada">Canada</a></td>
  </tr>
  <tr>
    <td>Magazzini Alimentari Riuniti</td>
    <td>Giovanni Rovelli</td>
    <td><a href="https://en.wikipedia.org/wiki/italy">Italy</a></td>
  </tr>
</table>

<h2>Text</h2>

<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
`;

function TableRenderer(props) {
  const tableProps = useHtmlTableProps(props);
  return React.createElement(ClickTable, tableProps);
}

TableRenderer.model = tableModel;

const htmlConfig = {
  renderers: {
    table: TableRenderer
  },
  tagsStyles: {
    table: {}
  },
  WebView,
  defaultWebViewProps: {}
};

export default function CustomExample({
  instance,
  onLinkPress,
  availableWidth
}) {
  return (
    <RenderHTML
      key={`custom-${instance}`}
      provideEmbeddedHeaders={(uri, tagName) => null}
      source={{ html: table1 }}
      contentWidth={availableWidth}
      renderersProps={{
        a: { onPress: onLinkPress },
        ...htmlConfig.renderersProps
      }}
      debug={false}
    />
  );
}
