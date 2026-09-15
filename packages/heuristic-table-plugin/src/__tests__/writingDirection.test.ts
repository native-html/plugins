import { createTableTNode } from './utils';
import TableLayout from '../TableLayout';
import { getSourceBlockStyle } from '../helpers/cellPadding';

describe('authored writing direction', () => {
  it('is recovered from the flow styles, where the processor files it', () => {
    const table = createTableTNode(
      '<table style="direction:rtl"><tr><td>A</td></tr></table>'
    );
    // `direction` is the sole block-flow property, so it never appears in the
    // retained box styles every other pass reads.
    expect(table.styles.nativeBlockRet).not.toHaveProperty('direction');
    expect(getSourceBlockStyle(table)).toMatchObject({ direction: 'rtl' });
  });

  it('inherits to a cell that declares none of its own', () => {
    const table = createTableTNode(
      '<table style="direction:rtl"><tr><td>A</td></tr></table>'
    );
    const layout = new TableLayout(table, { contentWidth: 400 });
    expect(getSourceBlockStyle(layout.cells[0]!.tnode)).toMatchObject({
      direction: 'rtl'
    });
  });

  it.each([
    ['ltr', { borderLeftWidth: 7, borderRightWidth: 0 }],
    ['rtl', { borderLeftWidth: 0, borderRightWidth: 7 }]
  ] as const)(
    'resolves a configured logical border onto the physical side %s implies',
    (direction, expected) => {
      const layout = new TableLayout(
        createTableTNode(
          `<table style="direction:${direction};border-collapse:collapse">` +
            '<tr><td>A</td></tr></table>'
        ),
        {
          contentWidth: 400,
          // Logical edges only reach a cell through the config callback: the
          // CSS processor drops `border-inline-start` and friends entirely.
          getStyleForCell: () => ({
            borderStartWidth: 7,
            borderStartColor: 'red'
          })
        }
      );
      expect(layout.tableBorderStyle).toMatchObject(expected);
    }
  );
});

describe('collapsed borders in multi-column tables', () => {
  it.each(['ltr', 'rtl'] as const)(
    'keeps the internal divider inside a %s table',
    (direction) => {
      const end = direction === 'rtl' ? 'Left' : 'Right';
      const start = direction === 'rtl' ? 'Right' : 'Left';
      const layout = new TableLayout(
        createTableTNode(
          `<table style="direction:${direction};border-collapse:collapse"><tr>` +
            `<td style="border-${end.toLowerCase()}-width:8px;border-${end.toLowerCase()}-color:red">A</td>` +
            `<td style="border-${start.toLowerCase()}-width:4px">B</td>` +
            '</tr></table>'
        ),
        { contentWidth: 300 }
      );
      expect(layout.tableBorderStyle).toMatchObject({
        borderLeftWidth: 0,
        borderRightWidth: 0
      });
      expect(layout.cellStyles.get(layout.cells[0]!.tnode)!.borderStyle).toMatchObject({
        [`border${end}Width`]: 8,
        [`border${end}Color`]: 'red',
        [`border${start}Width`]: 0
      });
      expect(layout.cellStyles.get(layout.cells[1]!.tnode)!.borderStyle).toMatchObject({
        borderLeftWidth: 0,
        borderRightWidth: 0
      });
    }
  );

  it('uses table direction for geometry and cell direction for logical borders', () => {
    const layout = new TableLayout(
      createTableTNode(
        '<table style="direction:rtl;border-collapse:collapse"><tr>' +
          '<td style="direction:ltr">A</td><td>B</td></tr></table>'
      ),
      {
        contentWidth: 300,
        getStyleForCell: (cell) => ({
          borderStartWidth: cell.x === 0 ? 8 : 4,
          borderStartColor: 'red'
        })
      }
    );
    // Both logical starts face the shared boundary despite opposite text directions.
    expect(layout.tableBorderStyle).toMatchObject({
      borderLeftWidth: 0,
      borderRightWidth: 0
    });
    expect(layout.cellStyles.get(layout.cells[0]!.tnode)!.borderStyle).toMatchObject({
      borderLeftWidth: 8,
      borderRightWidth: 0,
      borderStartWidth: undefined
    });
  });

  it('resolves RTL outer edges and every neighbour of a spanning cell', () => {
    const layout = new TableLayout(
      createTableTNode(
        '<table style="direction:rtl;border-collapse:collapse"><tr>' +
          '<td rowspan="2" colspan="2">A</td><td>B</td></tr>' +
          '<tr><td>C</td></tr></table>'
      ),
      {
        contentWidth: 300,
        getStyleForCell: (cell) => cell.x === 0
          ? { borderRightWidth: 7, borderLeftWidth: 2 }
          : {
              borderRightWidth: cell.y === 0 ? 4 : 9,
              borderRightColor: cell.y === 0 ? 'blue' : 'red',
              borderLeftWidth: 3,
              borderBottomWidth: 5
            }
      }
    );
    expect(layout.tableBorderStyle).toMatchObject({
      borderRightWidth: 7,
      borderLeftWidth: 3,
      borderBottomWidth: 5
    });
    expect(layout.cellStyles.get(layout.cells[0]!.tnode)!.borderStyle).toMatchObject({
      borderLeftWidth: 9,
      borderLeftColor: 'red',
      borderRightWidth: 0
    });
    expect(layout.cellStyles.get(layout.cells[1]!.tnode)!.borderStyle).toMatchObject({
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderBottomWidth: 5
    });
  });
});
