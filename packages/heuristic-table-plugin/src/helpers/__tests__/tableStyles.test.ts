import { I18nManager } from 'react-native';
import {
  getCollapsedCellBorderStyle,
  getCollapsedTableBorderStyle,
  getDefaultCellPaddingStyle,
  resolveBorderCollapse,
  resolveCellVerticalAlign
} from '../tableStyles';
import fillTableDisplay, { createEmptyDisplay } from '../fillTableDisplay';
import { createCellTNode, createTableTNode } from './utils';

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
        resolveCellVerticalAlign(
          createCellTNode('<table><tr><td>A</td></tr></table>')
        )
      ).toBeNull();
    });

    it('honours inline cell alignment', () => {
      expect(
        resolveCellVerticalAlign(
          createCellTNode(
            '<table><tr><td style="vertical-align: bottom">A</td></tr></table>'
          )
        )
      ).toBe('bottom');
    });

    it('inherits inline row alignment', () => {
      expect(
        resolveCellVerticalAlign(
          createCellTNode(
            '<table><tr style="vertical-align: top"><td>A</td></tr></table>'
          )
        )
      ).toBe('top');
    });

    it('honours the legacy valign attribute', () => {
      expect(
        resolveCellVerticalAlign(
          createCellTNode(
            '<table><tr><td valign="baseline">A</td></tr></table>'
          )
        )
      ).toBe('baseline');
    });

    it.each(['vertical-align: TOP', 'valign="TOP"'])(
      'matches the keyword in %s whatever its case',
      (declaration) => {
        const attribute = declaration.startsWith('valign');
        expect(
          resolveCellVerticalAlign(
            createCellTNode(
              `<table><tr><td ${
                attribute ? declaration : `style="${declaration}"`
              }>A</td></tr></table>`
            )
          )
        ).toBe('top');
      }
    );

    it('honours an important declaration without its keyword', () => {
      expect(
        resolveCellVerticalAlign(
          createCellTNode(
            '<table><tr><td style="vertical-align: bottom !important">A</td></tr></table>'
          )
        )
      ).toBe('bottom');
    });

    it('takes the last of several declarations, as the cascade does', () => {
      expect(
        resolveCellVerticalAlign(
          createCellTNode(
            '<table><tr><td style="vertical-align: top; vertical-align: bottom">A</td></tr></table>'
          )
        )
      ).toBe('bottom');
    });

    it('skips inline style segments that declare nothing', () => {
      // A trailing semicolon leaves an empty segment, and a malformed one has
      // no colon to split on. Neither may derail the properties around them.
      expect(
        resolveCellVerticalAlign(
          createCellTNode(
            '<table><tr><td style="color: red; oops; vertical-align: bottom;">A</td></tr></table>'
          )
        )
      ).toBe('bottom');
    });

    it.each(['initial', 'unset'])(
      'resets %s to the CSS initial value',
      (keyword) => {
        expect(
          resolveCellVerticalAlign(
            createCellTNode(
              `<table><tr><td style="vertical-align: ${keyword}">A</td></tr></table>`
            )
          )
        ).toBe('baseline');
      }
    );

    it.each(['10px', '50%', 'super', 'text-bottom'])(
      'treats the inline-only value %s as baseline, as CSS does for a cell',
      (value) => {
        expect(
          resolveCellVerticalAlign(
            createCellTNode(
              `<table><tr><td style="vertical-align: ${value}">A</td></tr></table>`
            )
          )
        ).toBe('baseline');
      }
    );

    it.each(['inherit', 'revert', 'revert-layer'])(
      'keeps walking up the tree past %s',
      (keyword) => {
        // The keyword declares nothing of its own: the cell takes whatever its
        // row declares, exactly as though it had said nothing at all.
        expect(
          resolveCellVerticalAlign(
            createCellTNode(
              `<table><tr style="vertical-align: top"><td style="vertical-align: ${keyword}">A</td></tr></table>`
            )
          )
        ).toBe('top');
      }
    );

    it('reports nothing when only an inherit keyword is declared', () => {
      expect(
        resolveCellVerticalAlign(
          createCellTNode(
            '<table><tr><td style="vertical-align: inherit">A</td></tr></table>'
          )
        )
      ).toBeNull();
    });
  });

  describe('default padding', () => {
    const ONE_PIXEL_EVERY_SIDE = {
      paddingTop: 1,
      paddingRight: 1,
      paddingBottom: 1,
      paddingLeft: 1
    };

    it('gives a bare cell one pixel on every side', () => {
      expect(
        getDefaultCellPaddingStyle(
          createCellTNode('<table><tr><td>A</td></tr></table>').styles
            .nativeBlockRet
        )
      ).toEqual(ONE_PIXEL_EVERY_SIDE);
    });

    it('leaves the sides an author declared alone', () => {
      // Source CSS reaches the plugin expanded per side, so a `padding-left`
      // replaces the default on that side alone — as it does in a browser.
      expect(
        getDefaultCellPaddingStyle(
          createCellTNode(
            '<table><tr><td style="padding-left: 8px">A</td></tr></table>'
          ).styles.nativeBlockRet
        )
      ).toEqual({ paddingTop: 1, paddingRight: 1, paddingBottom: 1 });
    });

    it('declares nothing for a cell padded on all sides', () => {
      expect(
        getDefaultCellPaddingStyle(
          createCellTNode(
            '<table><tr><td style="padding: 8px">A</td></tr></table>'
          ).styles.nativeBlockRet
        )
      ).toEqual({});
    });

    it('keeps a zero padding at zero', () => {
      expect(
        getDefaultCellPaddingStyle(
          createCellTNode(
            '<table><tr><td style="padding: 0">A</td></tr></table>'
          ).styles.nativeBlockRet
        )
      ).toEqual({});
    });

    it('reads a shorthand from the config as a declaration of every side', () => {
      // Yoga resolves a side against its own edge before the `padding` one, so
      // a longhand default would outrank this shorthand however it is merged.
      expect(getDefaultCellPaddingStyle(null, { padding: 8 })).toEqual({});
    });

    it('reads an axis shorthand from the config on that axis alone', () => {
      expect(getDefaultCellPaddingStyle(null, { paddingVertical: 8 })).toEqual({
        paddingRight: 1,
        paddingLeft: 1
      });
    });

    it('reserves both horizontal sides for a writing-direction keyword', () => {
      // Which side `paddingStart` lands on is not known here, so neither may
      // be given a default that would fight it.
      expect(getDefaultCellPaddingStyle(null, { paddingStart: 8 })).toEqual({
        paddingTop: 1,
        paddingBottom: 1
      });
    });

    it('lets the config decide a side the source CSS left bare', () => {
      expect(
        getDefaultCellPaddingStyle(
          createCellTNode(
            '<table><tr><td style="padding-top: 8px">A</td></tr></table>'
          ).styles.nativeBlockRet,
          { paddingHorizontal: 4 }
        )
      ).toEqual({ paddingBottom: 1 });
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

    it('reads the legacy rules attribute as a collapsed table', () => {
      // The HTML rendering rules give any `rules` value collapsed borders.
      const table = createTableTNode(
        '<table rules="all"><tr><td>A</td></tr></table>'
      );
      expect(resolveBorderCollapse(table)).toBe(true);
    });

    it.each(['collapse', 'separate'] as const)(
      'inherits %s from an ancestor that declares it',
      (value) => {
        // `border-collapse` is inherited, and only inline declarations survive
        // the CSS processor, so the ancestors have to be walked by hand.
        const table = createTableTNode(
          `<div style="border-collapse: ${value}"><section><table><tr><td>A</td></tr></table></section></div>`
        );
        expect(resolveBorderCollapse(table)).toBe(value === 'collapse');
      }
    );

    it('prefers its own declaration to an inherited one', () => {
      const table = createTableTNode(
        '<div style="border-collapse: collapse"><table style="border-collapse: separate"><tr><td>A</td></tr></table></div>'
      );
      expect(resolveBorderCollapse(table)).toBe(false);
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
        borderStyle: 'solid',
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
        borderLeftColor: 'blue',
        borderStyle: 'solid'
      });
    });

    it('uses the stronger border from the adjacent cell at a shared edge', () => {
      expect(
        getCollapsedCellBorderStyle(
          { x: 1, y: 1, lenX: 1, lenY: 1 },
          {
            borderLeftWidth: 9,
            borderLeftColor: 'green',
            borderRightWidth: 1,
            borderRightColor: 'blue'
          },
          {
            maxX: 3,
            maxY: 3,
            tableBorderStyle: FRAMED,
            cells: [
              {
                x: 2,
                y: 1,
                lenX: 1,
                lenY: 1,
                tnode: createCellTNode('<table><tr><td>A</td></tr></table>')
              }
            ],
            getCellStyle: () => ({ borderLeftWidth: 4, borderLeftColor: 'red' })
          }
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

  describe('writing direction', () => {
    // A style which declares no `direction` of its own follows the locale, so
    // the side a logical edge lands on is only knowable from `I18nManager`.
    // This is the branch a right-to-left app takes, and the explicit
    // `direction` one covered elsewhere never reaches it.
    afterEach(() => jest.restoreAllMocks());

    const LOGICAL_START = { borderStartWidth: 7, borderStartColor: 'red' };

    it.each([
      [false, 'borderLeftWidth'],
      [true, 'borderRightWidth']
    ] as const)(
      'resolves a logical start edge with isRTL %s',
      (isRTL, physicalSide) => {
        jest.replaceProperty(I18nManager, 'isRTL', isRTL);
        expect(
          getCollapsedCellBorderStyle(
            { x: 0, y: 0, lenX: 1, lenY: 1 },
            LOGICAL_START,
            { maxX: 0, maxY: 0, tableBorderStyle: null }
          )
        ).toMatchObject({ [physicalSide]: 7 });
      }
    );

    it('lets an explicit direction outrank the locale', () => {
      jest.replaceProperty(I18nManager, 'isRTL', true);
      expect(
        getCollapsedCellBorderStyle(
          { x: 0, y: 0, lenX: 1, lenY: 1 },
          { ...LOGICAL_START, direction: 'ltr' },
          { maxX: 0, maxY: 0, tableBorderStyle: null }
        )
      ).toMatchObject({ borderLeftWidth: 7, borderRightWidth: 0 });
    });
  });
});
