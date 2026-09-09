import {
  getCollapsedCellBorderStyle,
  getCollapsedTableBorderStyle,
  resolveBorderCollapse,
  resolveCellVerticalAlign
} from '../tableStyles';
import fillTableDisplay, { createEmptyDisplay } from '../fillTableDisplay';
import { createTableTNode } from './utils';

function findCell(html: string, x = 0) {
  const table = createTableTNode(html);
  const cells = [] as typeof table.children;
  const visit = (node: (typeof table.children)[number]) => {
    if (node.tagName === 'td' || node.tagName === 'th') {
      cells.push(node);
    } else {
      node.children.forEach(visit);
    }
  };
  table.children.forEach(visit);
  return cells[x];
}

/** A wrapper that paints all four of its resolved outer edges. */
const FRAMED = {
  borderTopWidth: 1,
  borderRightWidth: 1,
  borderBottomWidth: 1,
  borderLeftWidth: 1
};

function displayFor(html: string) {
  const table = createTableTNode(html);
  const display = createEmptyDisplay({ contentWidth: 400 });
  fillTableDisplay(table, display);
  return { display, table };
}

describe('table styles', () => {
  describe('vertical alignment', () => {
    it('declares nothing when the cell inherits the HTML default', () => {
      expect(
        resolveCellVerticalAlign(findCell('<table><tr><td>A</td></tr></table>'))
      ).toBeNull();
    });

    it('honours inline cell alignment', () => {
      expect(
        resolveCellVerticalAlign(
          findCell(
            '<table><tr><td style="vertical-align: bottom">A</td></tr></table>'
          )
        )
      ).toBe('bottom');
    });

    it('inherits inline row alignment', () => {
      expect(
        resolveCellVerticalAlign(
          findCell(
            '<table><tr style="vertical-align: top"><td>A</td></tr></table>'
          )
        )
      ).toBe('top');
    });

    it('honours the legacy valign attribute', () => {
      expect(
        resolveCellVerticalAlign(
          findCell('<table><tr><td valign="baseline">A</td></tr></table>')
        )
      ).toBe('baseline');
    });
  });

  describe('border collapse', () => {
    it('keeps separate borders by default', () => {
      const table = createTableTNode('<table><tr><td>A</td></tr></table>');
      expect(resolveBorderCollapse(table)).toBe(false);
    });

    it('honours an inline border-collapse declaration', () => {
      const table = createTableTNode(
        '<table style="border-collapse: collapse"><tr><td>A</td></tr></table>'
      );
      expect(resolveBorderCollapse(table)).toBe(true);
    });

    it('allows renderer config to override inline CSS', () => {
      const table = createTableTNode(
        '<table style="border-collapse: collapse"><tr><td>A</td></tr></table>'
      );
      expect(resolveBorderCollapse(table, 'separate')).toBe(false);
    });

    it('removes duplicate leading and top cell edges', () => {
      // An interior cell keeps only the trailing and bottom halves it owns.
      expect(
        getCollapsedCellBorderStyle(
          { x: 1, y: 1, lenX: 1, lenY: 1 },
          { borderWidth: 1, borderColor: 'black' },
          { maxX: 2, maxY: 2, tableBorderStyle: FRAMED }
        )
      ).toEqual({
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderRightWidth: 1,
        borderRightColor: 'black',
        borderBottomWidth: 1,
        borderBottomColor: 'black'
      });
    });

    it('lets the table wrapper own all resolved outside edges', () => {
      expect(
        getCollapsedCellBorderStyle(
          { x: 0, y: 0, lenX: 1, lenY: 1 },
          { borderWidth: 1, borderColor: 'black' },
          { maxX: 0, maxY: 0, tableBorderStyle: FRAMED }
        )
      ).toEqual({
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0
      });
    });

    it('rules off interior rows from a border-top-only cell', () => {
      // The boundary below the cell is the same declaration as the one above
      // the next row, and it is the only half this cell can paint.
      expect(
        getCollapsedCellBorderStyle(
          { x: 0, y: 0, lenX: 1, lenY: 1 },
          { borderTopWidth: 2, borderTopColor: 'red' },
          {
            maxX: 0,
            maxY: 3,
            tableBorderStyle: { ...FRAMED, borderBottomWidth: 0 }
          }
        )
      ).toMatchObject({ borderBottomWidth: 2, borderBottomColor: 'red' });
    });

    it('rules off interior columns from a border-left-only cell', () => {
      expect(
        getCollapsedCellBorderStyle(
          { x: 1, y: 0, lenX: 1, lenY: 1 },
          { borderLeftWidth: 2, borderLeftColor: 'red' },
          { maxX: 3, maxY: 0, tableBorderStyle: FRAMED }
        )
      ).toMatchObject({ borderRightWidth: 2, borderRightColor: 'red' });
    });

    it('keeps an outside edge the table wrapper does not paint', () => {
      // A border a cell only gets from `getStyleForCell` is invisible to the
      // wrapper resolution, so stripping it here would lose the frame.
      expect(
        getCollapsedCellBorderStyle(
          { x: 0, y: 0, lenX: 1, lenY: 1 },
          { borderWidth: 1, borderColor: 'blue' },
          {
            maxX: 0,
            maxY: 0,
            tableBorderStyle: {
              borderTopWidth: 0,
              borderRightWidth: 0,
              borderBottomWidth: 0,
              borderLeftWidth: 0
            }
          }
        )
      ).toEqual({
        borderTopWidth: 1,
        borderTopColor: 'blue',
        borderRightWidth: 1,
        borderRightColor: 'blue',
        borderBottomWidth: 1,
        borderBottomColor: 'blue',
        borderLeftWidth: 1,
        borderLeftColor: 'blue'
      });
    });

    it('keeps the stronger half of an interior boundary', () => {
      expect(
        getCollapsedCellBorderStyle(
          { x: 1, y: 1, lenX: 1, lenY: 1 },
          {
            borderLeftWidth: 4,
            borderLeftColor: 'red',
            borderRightWidth: 1,
            borderRightColor: 'blue'
          },
          { maxX: 3, maxY: 3, tableBorderStyle: FRAMED }
        )
      ).toMatchObject({ borderRightWidth: 4, borderRightColor: 'red' });
    });

    it('promotes a stronger cell border to the outside table edge', () => {
      const { display, table } = displayFor(`
        <table style="border: .5px solid #dfdfdf">
          <tr><td style="border: 1px solid black">A</td></tr>
        </table>
      `);
      expect(
        getCollapsedTableBorderStyle(display, table.styles.nativeBlockRet)
      ).toMatchObject({
        borderTopWidth: 1,
        borderTopColor: 'black',
        borderRightWidth: 1,
        borderRightColor: 'black',
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        borderLeftWidth: 1,
        borderLeftColor: 'black'
      });
    });

    it('clips a rowspan overrunning the last row to the bottom edge', () => {
      // The table does not grow rows to fit an oversized `rowspan`, so the
      // spanning cell sits at the bottom edge the wrapper painted rather than
      // ruling off a row of its own underneath it.
      expect(
        getCollapsedCellBorderStyle(
          { x: 0, y: 0, lenX: 1, lenY: 5 },
          { borderBottomWidth: 3, borderBottomColor: 'red' },
          { maxX: 1, maxY: 1, tableBorderStyle: FRAMED }
        )
      ).toMatchObject({ borderBottomWidth: 0 });
    });

    it('resolves the outside edge over the rows the table has', () => {
      // A `rowspan` past the last row must not take the bottom edge with it:
      // the cells of the last row still meet the wrapper there.
      const { display, table } = displayFor(`
        <table>
          <tr>
            <td rowspan="5">A</td>
            <td style="border: 3px solid red">B</td>
          </tr>
          <tr><td style="border: 5px solid blue">C</td></tr>
        </table>
      `);
      expect(display.maxY).toBe(1);
      expect(
        getCollapsedTableBorderStyle(display, table.styles.nativeBlockRet)
      ).toMatchObject({ borderBottomWidth: 5, borderBottomColor: 'blue' });
    });

    it('weighs the styles a cell only gets from the config', () => {
      // `getStyleForCell` is invisible to the source CSS resolution, so a
      // border it declares would otherwise lose to the weaker table one and
      // be painted by neither the wrapper nor the cell.
      const { display, table } = displayFor(`
        <table style="border: 1px solid #dfdfdf">
          <tr><td>A</td></tr>
        </table>
      `);
      expect(
        getCollapsedTableBorderStyle(
          display,
          table.styles.nativeBlockRet,
          (cell) => ({
            ...cell.tnode.styles.nativeBlockRet,
            borderWidth: 3,
            borderColor: 'red'
          })
        )
      ).toMatchObject({
        borderTopWidth: 3,
        borderTopColor: 'red',
        borderRightWidth: 3,
        borderBottomWidth: 3,
        borderLeftWidth: 3
      });
    });

    it('gives an equal cell border precedence over the table color', () => {
      const { display, table } = displayFor(`
        <table style="border: 1px solid red">
          <tr><td style="border: 1px solid blue">A</td></tr>
        </table>
      `);
      expect(
        getCollapsedTableBorderStyle(display, table.styles.nativeBlockRet)
      ).toMatchObject({
        borderTopColor: 'blue',
        borderRightColor: 'blue',
        borderBottomColor: 'blue',
        borderLeftColor: 'blue'
      });
    });
  });
});
