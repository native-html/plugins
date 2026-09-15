import buildTableGrid from '../buildTableGrid';
import { createTableTNode } from '../../__tests__/utils';
import createRenderTree, { makeTableCells } from '../createRenderTree';
import {
  TableCell,
  TableFlexColumnContainer,
  TableFlexRowContainer,
  TableRoot
} from '../../shared-types';

function makeRenderTree(html: string, columnWidths: number[]) {
  const tnode = createTableTNode(html);
  // The render tree is built from coordinates and widths alone, so the grid
  // needs no measurement pass to produce one.
  return createRenderTree(makeTableCells(buildTableGrid(tnode), columnWidths));
}

function rowContainer(
  children: TableFlexRowContainer['children']
): TableFlexRowContainer {
  return {
    type: 'row-container',
    children: children as any
  };
}
function colContainer(
  children: TableFlexColumnContainer['children']
): TableFlexColumnContainer {
  return {
    type: 'col-container',
    children: children as any
  };
}
function cell(c: Partial<TableCell>) {
  return {
    type: 'cell',
    ...c
  } as TableCell;
}
function root(children: TableRoot['children']): TableRoot {
  return {
    type: 'root',
    children: children as any
  };
}

describe('createRenderTree', () => {
  it('should handle empty table layout', () => {
    expect(
      makeRenderTree('<table><tr><td></td></tr></table>', [0])
    ).toMatchObject({
      type: 'root'
    });
  });
  it('should handle simple table layout', () => {
    expect(
      makeRenderTree(
        `
    <table>
      <tr>
        <th>A</th>
        <th>B</th>
      </tr>
      <tr>
        <td>C</td>
        <td>C</td>
      </tr>
    </table>
    `,
        [20, 10]
      )
    ).toMatchObject(
      root([
        rowContainer([
          cell({
            width: 20
          }),
          cell({
            width: 10
          })
        ]),
        rowContainer([
          cell({
            width: 20
          }),
          cell({
            width: 10
          })
        ])
      ])
    );
  });
  it('should handle colspan', () => {
    expect(
      makeRenderTree(
        `
      <table>
        <tr>
          <th colspan="2">A</th>
        </tr>
        <tr>
          <td>B</td>
          <td>C</td>
        </tr>
      </table>`,
        [20, 10]
      )
    ).toMatchObject(
      root([
        rowContainer([
          cell({
            width: 30,
            x: 0,
            y: 0,
            lenX: 2,
            lenY: 1
          })
        ]),
        rowContainer([
          cell({
            width: 20
          }),
          cell({
            width: 10
          })
        ])
      ])
    );
  });
  it('should handle rowspan (x1)', () => {
    expect(
      makeRenderTree(
        `
    <table>
      <tr>
        <th>A</th>
        <th>B</th>
        <th>C</th>
        <th>D</th>
      </tr>
      <tr>
        <td>D</td>
        <td rowspan="2">E</td>
        <td>F</td>
        <th>G</th>
      </tr>
      <tr>
      <td>H</td>
      <td>I</td>
      <td>J</td>
      </tr>
    </table>
    `,
        [20, 10, 5, 12]
      )
    ).toMatchObject(
      root([
        rowContainer([
          cell({
            width: 20
          }),
          cell({
            width: 10
          }),
          cell({
            width: 5
          }),
          cell({
            width: 12
          })
        ]),
        rowContainer([
          colContainer([
            rowContainer([
              cell({
                width: 20,
                x: 0,
                y: 1
                // D
              })
            ]),
            rowContainer([
              cell({
                width: 20,
                x: 0,
                y: 2
                // H
              })
            ])
          ]),
          colContainer([
            rowContainer([
              cell({
                width: 10,
                x: 1,
                y: 1,
                lenY: 2
                // E
              })
            ])
          ]),
          colContainer([
            rowContainer([
              cell({
                width: 5,
                x: 2,
                y: 1
                // F
              }),
              cell({
                width: 12,
                x: 3,
                y: 1
                // G
              })
            ]),
            rowContainer([
              cell({
                width: 5,
                x: 2,
                y: 2
                // I
              }),
              cell({
                width: 12,
                x: 3,
                y: 2
                // J
              })
            ])
          ])
        ])
      ])
    );
  });
  it('should handle rowspan (x2)', () => {
    expect(
      makeRenderTree(
        `<table>
      <tr>
        <td rowspan="2">January</td>
        <td>$100</td>
        <td rowspan="2">$50</td>
      </tr>
      <tr>
        <td>$80</td>
      </tr>
    </table>`,
        [20, 10, 5]
      )
    ).toMatchObject(
      root([
        rowContainer([
          colContainer([
            rowContainer([
              cell({
                width: 20,
                x: 0,
                y: 0,
                lenY: 2
                // January
              })
            ])
          ]),
          colContainer([
            rowContainer([
              cell({
                width: 10,
                x: 1,
                y: 0,
                lenY: 1
                // $100
              })
            ]),
            rowContainer([
              cell({
                width: 10,
                x: 1,
                y: 1,
                lenY: 1
                // $80
              })
            ])
          ]),
          colContainer([
            rowContainer([
              cell({
                width: 5,
                x: 2,
                y: 0,
                lenY: 2
                // $50
              })
            ])
          ])
        ])
      ])
    );
  });
});
