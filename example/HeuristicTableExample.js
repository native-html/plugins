import React from 'react';
import RenderHTML from 'react-native-render-html';
import tableRenderers from '@native-html/heuristic-table-plugin';

const table1 = `

The heuristic table is a pure native table component which evaluates content of each cell (<code>TNode</code>) to
compute the best width possible for the corresponding column. It doesn't follow strictly the table layout CSS standard,
but it should be a good enough approximation for a majority of use cases.

<h2>Standard table</h2>

<table>
  <tr>
    <th>Index</th>
    <th>Company</th>
    <th>Contact</th>
    <th>Country</th>
  </tr>
  <tr>
    <td>1</td>
    <td>Alfreds Futterkiste website</td>
    <td>Maria Anders</td>
    <td><a class="a" href="https://en.wikipedia.org/wiki/germany">Germany</a></td>
  </tr>
  <tr>
    <td>2</td>
    <td>Centro comercial Moctezuma</td>
    <td>Francisco Chang</td>
    <td><a href="https://en.wikipedia.org/wiki/mexico">Mexico</a></td>
  </tr>
  <tr>
    <td>3</td>
    <td>Ernst Handel</td>
    <td>Roland Mendel</td>
    <td><a href="https://en.wikipedia.org/wiki/austria">Austria</a></td>
  </tr>
  <tr>
    <td>4</td>
    <td>Island Trading</td>
    <td>Helen Bennett</td>
    <td><a href="https://en.wikipedia.org/wiki/united_kingdom">UK</td>
  </tr>
  <tr>
    <td>5</td>
    <td>Laughing Bacchus Winecellars</td>
    <td>Yoshi Tannamuri</td>
    <td><a href="https://en.wikipedia.org/wiki/canada">Canada</a></td>
  </tr>
  <tr>
    <td>6</td>
    <td>Magazzini Alimentari Riuniti</td>
    <td>Giovanni Rovelli</td>
    <td><a href="https://en.wikipedia.org/wiki/italy">Italy</a></td>
  </tr>
  <tr>
    <td>7</td>
    <td>Alfreds Futterkiste website</td>
    <td>Maria Anders</td>
    <td><a href="https://en.wikipedia.org/wiki/germany">Germany</a></td>
  </tr>
  <tr>
    <td>8</td>
    <td>Centro comercial Moctezuma</td>
    <td>Francisco Chang</td>
    <td><a href="https://en.wikipedia.org/wiki/mexico">Mexico</a></td>
  </tr>
  <tr>
    <td>9</td>
    <td>Ernst Handel</td>
    <td>Roland Mendel</td>
    <td><a href="https://en.wikipedia.org/wiki/austria">Austria</a></td>
  </tr>
  <tr>
    <td>10</td>
    <td>Island Trading</td>
    <td>Helen Bennett</td>
    <td><a href="https://en.wikipedia.org/wiki/united_kingdom">UK</td>
  </tr>
  <tr>
    <td>11</td>
    <td>Laughing Bacchus Winecellars</td>
    <td>Yoshi Tannamuri</td>
    <td><a href="https://en.wikipedia.org/wiki/canada">Canada</a></td>
  </tr>
  <tr>
    <td>12</td>
    <td>Magazzini Alimentari Riuniti</td>
    <td>Giovanni Rovelli</td>
    <td><a href="https://en.wikipedia.org/wiki/italy">Italy</a></td>
  </tr>
  <tr>
    <td>13</td>
    <td>Alfreds Futterkiste website</td>
    <td>Maria Anders</td>
    <td><a href="https://en.wikipedia.org/wiki/germany">Germany</a></td>
  </tr>
  <tr>
    <td>14</td>
    <td>Centro comercial Moctezuma</td>
    <td>Francisco Chang</td>
    <td><a href="https://en.wikipedia.org/wiki/mexico">Mexico</a></td>
  </tr>
</table>

<h2>Table with colspan cell</h2>

<table>
<tr>
  <th>Month</th>
  <th>Savings</th>
  <th>Savings for holiday!</th>
</tr>
<tr>
  <td colspan="2">January</td>
  <td>$100</td>
</tr>
</table>

<h2>Table with rowspan cells (left)</h2>

<table>
  <tr>
    <th>Month</th>
    <th>Fortnight</th>
    <th>Savings</th>
  </tr>
  <tr>
    <td rowspan="2">January</td>
    <td>first</td>
    <td >$50</td>
  </tr>
  <tr>
    <td >second</td>
    <td>$80</td>
  </tr>
</table>

<h2>Table with rowspan cell (right)</h2>

<table>
<tr>
  <th>Month</th>
  <th>Savings</th>
  <th>Savings for holiday!</th>
</tr>
<tr>
  <td>January</td>
  <td>$100</td>
  <td rowspan="2">$50</td>
</tr>
<tr>
  <td>February</td>
  <td>$80</td>
</tr>
</table>

<h2>Table with rowspan cell (left and right)</h2>

<table>
<tr>
  <th>Month</th>
  <th>Savings</th>
  <th>Savings for holiday!</th>
</tr>
<tr>
  <td rowspan="2">January</td>
  <td>$100</td>
  <td rowspan="2">$50</td>
</tr>
<tr>
  <td>$80</td>
</tr>
</table>

<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
`;

const htmlConfig = {
  renderers: tableRenderers,
  renderersProps: {
    table: {
      getStyleForCell(cell) {
        return cell.tnode.tagName === 'td'
          ? {
              backgroundColor:
                cell.y % 2 > 0
                  ? 'rgba(65, 91, 118, .05)'
                  : 'rgba(65, 91, 118, .30)'
            }
          : null;
      }
    }
  },
  tagsStyles: {
    a: {
      color: '#419edc',
      textDecorationColor: '#419edc'
    },
    table: {
      borderColor: '#dfdfdf',
      borderWidth: 0.5
    },
    th: {
      textAlign: 'center',
      backgroundColor: '#243445',
      color: '#fefefe',
      padding: 5,
      borderColor: '#2f455b',
      borderWidth: 0.5
    },
    td: {
      textAlign: 'center',
      padding: 5,
      borderColor: '#dfdfdf',
      borderWidth: 0.5
    }
  }
};

export default function HeuristicTable({
  instance,
  onLinkPress,
  availableWidth
}) {
  return (
    <RenderHTML
      key={`custom-${instance}`}
      source={{ html: table1 }}
      onLinkPress={onLinkPress}
      contentWidth={availableWidth}
      {...htmlConfig}
      debug={false}
    />
  );
}
