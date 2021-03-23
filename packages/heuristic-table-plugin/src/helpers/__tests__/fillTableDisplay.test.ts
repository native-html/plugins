import { TNode } from 'react-native-render-html';
import fillTableDisplay, { createEmptyDisplay } from '../fillTableDisplay';
import TCellConstraintsComputer from '../TCellConstraintsComputer';
import { createTableTNode } from './utils';

function createDisplay(tnode: TNode) {
  const display = createEmptyDisplay({ contentWidth: 1000 });
  fillTableDisplay(tnode, display, new TCellConstraintsComputer({}));
  return display;
}

describe('fillTableDisplay', () => {
  it('should parse cells', () => {
    const table = `
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
    `;
    const tnode = createTableTNode(table);
    const display = createDisplay(tnode);
    expect(display.maxX).toBe(1);
    expect(display.maxY).toBe(1);
    expect(display.cells).toMatchObject([
      {
        lenX: 1,
        lenY: 1,
        x: 0,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 1,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 0,
        y: 1
      },
      {
        lenX: 1,
        lenY: 1,
        x: 1,
        y: 1
      }
    ]);
  });
  it('should take colspan into account to compute cell coordinates', () => {
    const table = `
    <table>
      <tr>
        <th>A</th>
        <th colspan="2">B</th>
        <th>C</th>
      </tr>
      <tr>
        <td>D</td>
      </tr>
    </table>`;
    const tnode = createTableTNode(table);
    const display = createDisplay(tnode);
    expect(display.offsetX).toBe(0);
    expect(display.maxX).toBe(3);
    expect(display.maxY).toBe(1);
    expect(display.cells).toMatchObject([
      {
        lenX: 1,
        lenY: 1,
        x: 0,
        y: 0
      },
      {
        lenX: 2,
        lenY: 1,
        x: 1,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 3,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 0,
        y: 1
      }
    ]);
  });
  it('should take rowspan into account to compute cell coordinates (x=0)', () => {
    const table = `
    <table>
      <tr>
        <th rowspan="2">A</th>
        <th>B</th>
        <th>C</th>
      </tr>
      <tr>
        <td>D</td>
        <td>F</td>
      </tr>
    </table>`;
    const tnode = createTableTNode(table);
    const display = createDisplay(tnode);
    expect(display.maxX).toBe(2);
    expect(display.maxY).toBe(1);
    expect(display.offsetX).toBe(0);
    expect(display.occupiedCoordinates).toMatchObject([{ x: 0, y: 1 }]);
    expect(display.cells).toMatchObject([
      {
        lenX: 1,
        lenY: 2,
        x: 0,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 1,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 2,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 1,
        y: 1
      },
      {
        lenX: 1,
        lenY: 1,
        x: 2,
        y: 1
      }
    ]);
  });
  it('should take rowspan into account to compute cell coordinates (x=1)', () => {
    const table = `
    <table>
      <tr>
        <th>A</th>
        <th rowspan="2">B</th>
        <th>C</th>
      </tr>
      <tr>
        <td>D</td>
        <td>F</td>
      </tr>
    </table>`;
    const tnode = createTableTNode(table);
    const display = createDisplay(tnode);
    expect(display.maxX).toBe(2);
    expect(display.maxY).toBe(1);
    expect(display.offsetX).toBe(0);
    expect(display.occupiedCoordinates).toMatchObject([{ x: 1, y: 1 }]);
    expect(display.cells).toMatchObject([
      {
        lenX: 1,
        lenY: 1,
        x: 0,
        y: 0
      },
      {
        lenX: 1,
        lenY: 2,
        x: 1,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 2,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 0,
        y: 1
      },
      {
        lenX: 1,
        lenY: 1,
        x: 2,
        y: 1
      }
    ]);
  });
  it('should take rowspan into account to compute cell coordinates (2x rowspan) ', () => {
    const table = `
    <table>
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
    const tnode = createTableTNode(table);
    const display = createDisplay(tnode);
    expect(display.maxX).toBe(2);
    expect(display.maxY).toBe(1);
    // expect(display.offsetX).toBe(2);
    expect(display.occupiedCoordinates).toMatchObject([
      { x: 0, y: 1 },
      { x: 2, y: 1 }
    ]);
    expect(display.cells).toMatchObject([
      {
        lenX: 1,
        lenY: 2,
        x: 0,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 1,
        y: 0
      },
      {
        lenX: 1,
        lenY: 2,
        x: 2,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 1,
        y: 1
      }
    ]);
  });
  it('should handle cells with both colspan and rowspan set', () => {
    const table = `
    <table>
      <tr>
        <th>0</th>
        <th>1</th>
        <th>2</th>
      </tr>
      <tr>
        <td>A</td>
        <td rowspan="2" colspan="2">B</td>
      </tr>
      <tr>
        <td>C</td>
      </tr>
    </table>
    `;
    const tnode = createTableTNode(table);
    const display = createDisplay(tnode);
    expect(display.maxX).toBe(2);
    expect(display.maxY).toBe(2);
    expect(display.offsetX).toBe(0);
    expect(display.cells).toMatchObject([
      {
        lenX: 1,
        lenY: 1,
        x: 0,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 1,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 2,
        y: 0
      },
      {
        lenX: 1,
        lenY: 1,
        x: 0,
        y: 1
      },
      {
        lenX: 2,
        lenY: 2,
        x: 1,
        y: 1
      },
      {
        lenX: 1,
        lenY: 1,
        x: 0,
        y: 2
      }
    ]);
  });
});
