import fillTableDisplay, { createEmptyDisplay } from '../fillTableDisplay';
import { createTableTNode } from './utils';
import createRenderTree from '../createRenderTree';

function makeRenderTree(html: string, columnWidths: number[]) {
  const tnode = createTableTNode(html);
  const display = createEmptyDisplay();
  fillTableDisplay(tnode, display);
  return createRenderTree(display, columnWidths);
}

describe('createRenderTree', () => {
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
    ).toMatchObject({
      type: 'root',
      children: [
        {
          type: 'row-container',
          children: [
            {
              type: 'cell',
              width: 20
            },
            {
              type: 'cell',
              width: 10
            }
          ]
        },
        {
          type: 'row-container',
          children: [
            {
              type: 'cell',
              width: 20
            },
            {
              type: 'cell',
              width: 10
            }
          ]
        }
      ]
    });
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
    ).toMatchObject({
      type: 'root',
      children: [
        {
          type: 'row-container',
          children: [
            {
              type: 'cell',
              width: 30,
              x: 0,
              y: 0,
              lenX: 2,
              lenY: 1
            }
          ]
        },
        {
          type: 'row-container',
          children: [
            {
              type: 'cell',
              width: 20
            },
            {
              type: 'cell',
              width: 10
            }
          ]
        }
      ]
    });
  });
  it('should handle rowspan', () => {
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
    ).toMatchObject({
      type: 'root',
      children: [
        {
          type: 'row-container',
          children: [
            {
              type: 'cell',
              width: 20
            },
            {
              type: 'cell',
              width: 10
            },
            {
              type: 'cell',
              width: 5
            },
            {
              type: 'cell',
              width: 12
            }
          ]
        },
        {
          type: 'row-container',
          children: [
            {
              type: 'col-container',
              children: [
                {
                  type: 'row-container',
                  children: [
                    {
                      type: 'cell',
                      width: 20,
                      x: 0,
                      y: 1
                      // D
                    }
                  ]
                },
                {
                  type: 'row-container',
                  children: [
                    {
                      type: 'cell',
                      width: 20,
                      x: 0,
                      y: 2
                      // H
                    }
                  ]
                }
              ]
            },
            {
              type: 'col-container',
              children: [
                {
                  type: 'row-container',
                  children: [
                    {
                      type: 'cell',
                      width: 10,
                      x: 1,
                      y: 1,
                      lenY: 2
                      // E
                    }
                  ]
                }
              ]
            },
            {
              type: 'col-container',
              children: [
                {
                  type: 'row-container',
                  children: [
                    {
                      type: 'cell',
                      width: 5,
                      x: 2,
                      y: 1
                      // F
                    },
                    {
                      type: 'cell',
                      width: 12,
                      x: 3,
                      y: 1
                      // G
                    }
                  ]
                },
                {
                  type: 'row-container',
                  children: [
                    {
                      type: 'cell',
                      width: 5,
                      x: 2,
                      y: 2
                      // I
                    },
                    {
                      type: 'cell',
                      width: 12,
                      x: 3,
                      y: 2
                      // J
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
  });
});
