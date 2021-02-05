import React from 'react';
import HTML from 'react-native-render-html';
import table from '@native-html/table-plugin';
import WebView from 'react-native-webview';

const table1 = `
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

<h2>Header 2</h2>

<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
`;

const renderers = {
  table
};

const htmlConfig = {
  renderers,
  WebView,
  renderersProps: {
    table: {
      animationType: 'animated',
      tableStyleSpecs: {
        outerBorderWidthPx: 1,
        rowsBorderWidthPx: 1,
        columnsBorderWidthPx: 1
      }
    }
  },
  tagsStyles: {
    table: {
      flex: 1
    }
  },
  defaultWebViewProps: {},
  computeEmbeddedMaxWidth: (contentWidth, tagName) => {
    if (tagName === 'table') {
      return Math.min(contentWidth, 500);
    }
    return contentWidth;
  }
};

export default function SimpleExample({
  instance,
  onLinkPress,
  availableWidth
}) {
  return (
    <HTML
      key={`simple-${instance}`}
      source={{ html: table1 }}
      onLinkPress={onLinkPress}
      contentWidth={availableWidth}
      {...htmlConfig}
    />
  );
}
