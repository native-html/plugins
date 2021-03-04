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
`;

const tableSpan = `
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
`;

const wideTable = `
<h2>Wide table overflowing horizontaly</h2>
<table
  id="example"
  class="display nowrap dataTable dtr-inline collapsed"
  role="grid"
  aria-describedby="example_info">
  <thead>
    <tr role="row">
      <th
        class="sorting sorting_asc"
        tabindex="0"
        aria-controls="example"
        rowspan="1"
        colspan="1"
        style="width: 104px"
        aria-sort="ascending"
        aria-label="Name: activate to sort column descending"
      >
        Name
      </th>
      <th
        class="sorting"
        tabindex="0"
        aria-controls="example"
        rowspan="1"
        colspan="1"
        style="width: 170px;"
        aria-label="Position: activate to sort column ascending"
      >
        Position
      </th>
      <th
        class="sorting"
        tabindex="0"
        aria-controls="example"
        rowspan="1"
        colspan="1"
        style="width: 76px;"
        aria-label="Office: activate to sort column ascending"
      >
        Office
      </th>
      <th
        class="dt-body-right sorting"
        tabindex="0"
        aria-controls="example"
        rowspan="1"
        colspan="1"
        style="width: 38px;"
        aria-label="Age: activate to sort column ascending"
      >
        Age
      </th>
      <th
        class="sorting"
        tabindex="0"
        aria-controls="example"
        rowspan="1"
        colspan="1"
        style="width: 110px;"
        aria-label="Start date: activate to sort column ascending"
      >
        Start date
      </th>
      <th
        class="dt-body-right sorting"
        tabindex="0"
        aria-controls="example"
        rowspan="1"
        colspan="1"
        style=""
        aria-label="Salary: activate to sort column ascending"
      >
        Salary
      </th>
    </tr>
  </thead>
  <tbody>
    <tr class="odd">
      <td tabindex="0" class="sorting_1">Airi Satou</td>
      <td style="">Accountant</td>
      <td style="">Tokyo</td>
      <td class="dt-body-right" style="">33</td>
      <td style="">2008/11/28</td>
      <td class="dt-body-right" >$162,700</td>
    </tr>
    <tr class="even">
      <td class="sorting_1" tabindex="0">Angelica Ramos</td>
      <td style="">Chief Executive Officer (CEO)</td>
      <td style="">London</td>
      <td class="dt-body-right" style="">47</td>
      <td style="">2009/10/09</td>
      <td class="dt-body-right" >$1,200,000</td>
    </tr>
    <tr class="odd">
      <td tabindex="0" class="sorting_1">Ashton Cox</td>
      <td style="">Junior Technical Author</td>
      <td style="">San Francisco</td>
      <td class="dt-body-right" style="">66</td>
      <td style="">2009/01/12</td>
      <td class="dt-body-right" >$86,000</td>
    </tr>
    <tr class="even">
      <td class="sorting_1" tabindex="0">Bradley Greer</td>
      <td style="">Software Engineer</td>
      <td style="">London</td>
      <td class="dt-body-right" style="">41</td>
      <td style="">2012/10/13</td>
      <td class="dt-body-right" >$132,000</td>
    </tr>
    <tr class="odd">
      <td class="sorting_1" tabindex="0">Brenden Wagner</td>
      <td style="">Software Engineer</td>
      <td style="">San Francisco</td>
      <td class="dt-body-right" style="">28</td>
      <td style="">2011/06/07</td>
      <td class="dt-body-right" >$206,850</td>
    </tr>
    <tr class="even">
      <td tabindex="0" class="sorting_1">Brielle Williamson</td>
      <td style="">Integration Specialist</td>
      <td style="">New York</td>
      <td class="dt-body-right" style="">61</td>
      <td style="">2012/12/02</td>
      <td class="dt-body-right" >$372,000</td>
    </tr>
    <tr class="odd">
      <td class="sorting_1" tabindex="0">Bruno Nash</td>
      <td style="">Software Engineer</td>
      <td style="">London</td>
      <td class="dt-body-right" style="">38</td>
      <td style="">2011/05/03</td>
      <td class="dt-body-right" >$163,500</td>
    </tr>
    <tr class="even">
      <td class="sorting_1" tabindex="0" style="outline: none">Caesar Vance</td>
      <td style="">Pre-Sales Support</td>
      <td style="">New York</td>
      <td class="dt-body-right" style="">21</td>
      <td style="">2011/12/12</td>
      <td class="dt-body-right" >$106,450</td>
    </tr>
    <tr class="odd">
      <td class="sorting_1" tabindex="0">Cara Stevens</td>
      <td style="">Sales Assistant</td>
      <td style="">New York</td>
      <td class="dt-body-right" style="">46</td>
      <td style="">2011/12/06</td>
      <td class="dt-body-right" >$145,600</td>
    </tr>
    <tr class="even">
      <td tabindex="0" class="sorting_1">Cedric Kelly</td>
      <td style="">Senior Javascript Developer</td>
      <td style="">Edinburgh</td>
      <td class="dt-body-right" style="">22</td>
      <td style="">2012/03/29</td>
      <td class="dt-body-right" >$433,060</td>
    </tr>
  </tbody>
</table>
`;

const htmlConfig = {
  renderers: tableRenderers,
  renderersProps: {
    table: {
      forceStretch: false,
      getStyleForCell(cell) {
        return cell.tnode.tagName === 'td'
          ? {
              backgroundColor:
                cell.y % 2 > 0
                  ? 'rgba(65, 91, 118, .02)'
                  : 'rgba(65, 91, 118, .10)'
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
      borderWidth: 0.5,
      marginVertical: 10
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
      source={{ html: `${table1}${wideTable}${tableSpan}` }}
      onLinkPress={onLinkPress}
      contentWidth={availableWidth}
      enableExperimentalMarginCollapsing
      {...htmlConfig}
      debug={false}
    />
  );
}
