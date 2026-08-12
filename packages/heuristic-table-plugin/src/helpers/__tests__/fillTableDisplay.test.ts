import { TNode } from '@native-html/render';
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
    // `offsetX` is the slot cursor of the row last laid out, so it ends up
    // just past that row's final cell.
    expect(display.offsetX).toBe(1);
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
    expect(display.offsetX).toBe(3);
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
    expect(display.offsetX).toBe(3);
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
    expect(display.offsetX).toBe(1);
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
  it('should skip past every slot claimed by consecutive rowspans', () => {
    // Two adjacent spanning cells block columns 0 and 1 of the second row, so
    // `D` belongs in column 2. Counting the blockers in one pass instead of
    // walking slot by slot would land it on column 1, on top of `B`.
    const table = `
    <table>
      <tr>
        <td rowspan="2">A</td>
        <td rowspan="2">B</td>
        <td>C</td>
      </tr>
      <tr>
        <td>D</td>
      </tr>
    </table>
    `;
    const display = createDisplay(createTableTNode(table));
    expect(display.cells).toMatchObject([
      { lenX: 1, lenY: 2, x: 0, y: 0 },
      { lenX: 1, lenY: 2, x: 1, y: 0 },
      { lenX: 1, lenY: 1, x: 2, y: 0 },
      { lenX: 1, lenY: 1, x: 2, y: 1 }
    ]);
  });
  it('should block every column a cell spans in the rows below it', () => {
    // `A` covers a 2x2 rectangle, so `C` starts at column 2 — not column 1,
    // which is still inside `A`.
    const table = `
    <table>
      <tr>
        <td colspan="2" rowspan="2">A</td>
        <td>B</td>
      </tr>
      <tr>
        <td>C</td>
      </tr>
    </table>
    `;
    const display = createDisplay(createTableTNode(table));
    expect(display.cells).toMatchObject([
      { lenX: 2, lenY: 2, x: 0, y: 0 },
      { lenX: 1, lenY: 1, x: 2, y: 0 },
      { lenX: 1, lenY: 1, x: 2, y: 1 }
    ]);
  });
  it.each([
    ['0', 1],
    ['-2', 1],
    ['', 1],
    ['abc', 1],
    ['2.5', 2],
    ['3', 3]
  ])('should clamp colspan="%s" to a valid span of %i', (colspan, expected) => {
    const table = `<table><tr><td colspan="${colspan}">A</td></tr></table>`;
    const display = createDisplay(createTableTNode(table));
    expect(display.cells[0]).toMatchObject({ lenX: expected, x: 0 });
  });
  it('should clamp an invalid rowspan rather than span nothing', () => {
    // `rowspan="0"` means "to the end of the row group" in HTML; row groups
    // are not modelled here, so it must at least not corrupt the grid.
    const table = `
    <table>
      <tr><td rowspan="0">A</td><td>B</td></tr>
      <tr><td>C</td></tr>
    </table>
    `;
    const display = createDisplay(createTableTNode(table));
    expect(display.cells).toMatchObject([
      { lenX: 1, lenY: 1, x: 0, y: 0 },
      { lenX: 1, lenY: 1, x: 1, y: 0 },
      { lenX: 1, lenY: 1, x: 0, y: 1 }
    ]);
  });
});
