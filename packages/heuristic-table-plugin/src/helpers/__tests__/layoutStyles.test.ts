import { CustomRendererProps, TBlock } from '@native-html/render';
import { ViewStyle } from 'react-native';
import TableLayout from '../../TableLayout';
import useHtmlTableCellProps from '../../useHtmlTableCellProps';
import { shouldScrollTable } from '../../HTMLTable';
import { Settings } from '../../shared-types';
import { createTableTNode } from './utils';

/**
 * The settings a layout was built from, so that `renderedCellStyle` can hand
 * the renderer the same config the measurement pass saw.
 */
const settingsByLayout = new WeakMap<TableLayout, Settings>();

function layoutFor(html: string, settings: Partial<Settings> = {}) {
  const resolvedSettings: Settings = {
    contentWidth: 100,
    forceStretch: false,
    // Pinned: the 9.1/11.1/16.1 constants below are one character of 14px text
    // at this coefficient, plus the user-agent cell padding. Leaving it to the
    // computer's default would break every one of them on a retune.
    baseFontCoeff: 0.65,
    ...settings
  };
  const layout = new TableLayout(createTableTNode(html), resolvedSettings);
  settingsByLayout.set(layout, resolvedSettings);
  return layout;
}

// Inspect renderer props directly; native layout and drawing are not exercised.
function renderedCellStyle(layout: TableLayout, index: number): ViewStyle {
  const cell = layout.cells[index]!;
  return useHtmlTableCellProps({
    tnode: cell.tnode,
    style: cell.tnode.styles.nativeBlockRet,
    propsFromParent: {
      cell,
      // The renderer only falls back to `config.getStyleForCell` when the
      // layout resolved no style for the cell. Passing the real settings keeps
      // that fallback meaningful rather than silently yielding no style.
      config: settingsByLayout.get(layout),
      resolvedCellStyle: layout.cellStyles.get(cell.tnode)
    }
  } as unknown as CustomRendererProps<TBlock>).style as ViewStyle;
}

describe('layout and resolved renderer styles', () => {
  it.each(['ltr', 'rtl'] as const)(
    'collapses logical borders in %s cell styles',
    (direction) => {
      const logicalSide = direction === 'ltr' ? 'Start' : 'End';
      const layout = layoutFor('<table><tr><td>A</td><td>B</td></tr></table>', {
        borderCollapse: 'collapse',
        getStyleForCell: (cell) =>
          cell.x === 0
            ? { borderRightWidth: 3, borderRightColor: 'blue' }
            : {
                direction,
                [`border${logicalSide}Width`]: 5,
                [`border${logicalSide}Color`]: 'red'
              }
      });
      expect(renderedCellStyle(layout, 0)).toMatchObject({
        borderRightWidth: 5,
        borderRightColor: 'red'
      });
      expect(renderedCellStyle(layout, 1).borderLeftWidth).toBe(0);
      expect(
        renderedCellStyle(layout, 1)[`border${logicalSide}Width`]
      ).toBeUndefined();
      expect(
        renderedCellStyle(layout, 1)[`border${logicalSide}Color`]
      ).toBeUndefined();
      expect(layout.totalWidth).toBeCloseTo(2 * 11.1 + 5);
    }
  );

  it('moves logical outer cell borders to the table wrapper', () => {
    const layout = layoutFor('<table><tr><td>A</td></tr></table>', {
      borderCollapse: 'collapse',
      getStyleForCell: () => ({
        borderStartWidth: 4,
        borderEndWidth: 6,
        borderStartColor: 'red',
        borderEndColor: 'blue'
      })
    });
    expect(layout.tableBorderStyle).toMatchObject({
      borderLeftWidth: 4,
      borderRightWidth: 6,
      borderLeftColor: 'red',
      borderRightColor: 'blue'
    });
    expect(layout.horizontalInsets).toBe(10);
    expect(renderedCellStyle(layout, 0).borderStartWidth).toBeUndefined();
    expect(renderedCellStyle(layout, 0).borderEndWidth).toBeUndefined();
    expect(layout.totalWidth).toBeCloseTo(11.1);
  });
  it('assigns a neighbour-only left border to the preceding cell', () => {
    const layout = layoutFor(`<table style="border-collapse:collapse"><tr>
      <td>A</td><td style="border-left-width:5px;border-style:solid;border-left-color:red">B</td>
    </tr></table>`);
    expect(renderedCellStyle(layout, 0)).toMatchObject({
      borderRightWidth: 5,
      borderRightColor: 'red'
    });
    expect(renderedCellStyle(layout, 1)).toMatchObject({ borderLeftWidth: 0 });
    expect(layout.columnWidths).toEqual([16.1, 11.1]);
  });

  it('assigns a neighbour-only top border to the preceding row', () => {
    const layout = layoutFor(`<table style="border-collapse:collapse">
      <tr><td>A</td></tr><tr><td style="border-top-width:5px;border-style:solid;border-top-color:red">B</td></tr>
    </table>`);
    expect(renderedCellStyle(layout, 0)).toMatchObject({
      borderBottomWidth: 5,
      borderBottomColor: 'red'
    });
    expect(renderedCellStyle(layout, 1)).toMatchObject({ borderTopWidth: 0 });
  });

  it('does not copy a cell left border onto its unrelated right edge', () => {
    const layout = layoutFor(`<table style="border-collapse:collapse"><tr>
      <td style="border-left-width:5px;border-style:solid;border-left-color:red">A</td><td>B</td>
    </tr></table>`);
    expect(renderedCellStyle(layout, 0).borderRightWidth).toBe(0);
    expect(layout.tableBorderStyle?.borderLeftWidth).toBe(5);
  });

  it('compares all neighbours touching a rowspan, excluding unrelated rows', () => {
    const layout = layoutFor(`<table style="border-collapse:collapse">
      <tr><td rowspan="2">A</td><td style="border-left-width:2px;border-style:solid;border-left-color:red">B</td></tr>
      <tr><td style="border-left-width:5px;border-style:solid;border-left-color:blue">C</td></tr>
      <tr><td>D</td><td style="border-left-width:9px;border-style:solid;border-left-color:green">E</td></tr>
    </table>`);
    expect(renderedCellStyle(layout, 0)).toMatchObject({
      borderRightWidth: 5,
      borderRightColor: 'blue'
    });
  });

  it('compares neighbours below a colspan', () => {
    const layout = layoutFor(`<table style="border-collapse:collapse">
      <tr><td colspan="2">A</td></tr>
      <tr><td style="border-top-width:2px;border-style:solid;border-top-color:red">B</td><td style="border-top-width:5px;border-style:solid;border-top-color:blue">C</td></tr>
    </table>`);
    expect(renderedCellStyle(layout, 0)).toMatchObject({
      borderBottomWidth: 5,
      borderBottomColor: 'blue'
    });
  });

  it.each(['dashed', 'dotted'] as const)(
    'preserves an exclusively %s frame',
    (borderStyle) => {
      const layout = layoutFor(`<table style="border-collapse:collapse"><tr>
      <td style="border:2px ${borderStyle} red">A</td>
    </tr></table>`);
      expect(layout.tableBorderStyle).toMatchObject({
        borderStyle,
        borderLeftWidth: 2
      });
    }
  );

  it('takes the style of a wider winner rather than a weaker solid table border', () => {
    const layout =
      layoutFor(`<table style="border-collapse:collapse;border:1px solid black"><tr>
      <td style="border:2px dashed red">A</td>
    </tr></table>`);
    expect(layout.tableBorderStyle?.borderStyle).toBe('dashed');
  });

  it('takes the winning style and color of an interior neighbour', () => {
    const layout = layoutFor(`<table style="border-collapse:collapse"><tr>
      <td style="border-right-width:1px;border-style:solid;border-right-color:blue">A</td><td style="border-left-width:5px;border-style:dashed;border-left-color:red">B</td>
    </tr></table>`);
    expect(renderedCellStyle(layout, 0)).toMatchObject({
      borderStyle: 'dashed',
      borderRightWidth: 5,
      borderRightColor: 'red'
    });
  });

  // The stronger border is placed first and last in turn, so that traversal
  // order cannot accidentally pick the winner. Both positions are separate
  // cases rather than one loop, so a failure names the one that broke.
  it.each([
    ['solid', 'dashed', true],
    ['solid', 'dashed', false],
    ['solid', 'dotted', true],
    ['solid', 'dotted', false],
    ['dashed', 'dotted', true],
    ['dashed', 'dotted', false]
  ] as const)(
    'prefers an equal-width %s border over a %s one, stronger declared first: %s',
    (stronger, weaker, strongerFirst) => {
      const first = strongerFirst ? stronger : weaker;
      const second = strongerFirst ? weaker : stronger;
      const firstColor = strongerFirst ? 'red' : 'blue';
      const secondColor = strongerFirst ? 'blue' : 'red';
      const interior = layoutFor(`<table style="border-collapse:collapse"><tr>
        <td style="border-right-width:2px;border-style:${first};border-right-color:${firstColor}">A</td>
        <td style="border-left-width:2px;border-style:${second};border-left-color:${secondColor}">B</td>
      </tr></table>`);
      expect(renderedCellStyle(interior, 0)).toMatchObject({
        borderStyle: stronger,
        borderRightWidth: 2,
        borderRightColor: 'red'
      });
      expect(renderedCellStyle(interior, 1).borderLeftWidth).toBe(0);
      const outer =
        layoutFor(`<table style="border-collapse:collapse;border:2px ${first} ${firstColor}">
        <tr><td style="border:2px ${second} ${secondColor}">A</td></tr>
      </table>`);
      expect(outer.tableBorderStyle).toMatchObject({
        borderStyle: stronger,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderTopColor: 'red',
        borderRightColor: 'red',
        borderBottomColor: 'red',
        borderLeftColor: 'red'
      });
    }
  );

  it('reserves collapsed outer borders only in the wrapper', () => {
    const layout = layoutFor(
      `<table style="border-collapse:collapse"><tr>
      <td style="border:10px solid black;padding:0">A</td>
    </tr></table>`,
      { contentWidth: 30 }
    );
    expect(layout.horizontalInsets).toBe(20);
    expect(layout.totalWidth).toBeCloseTo(9.1);
    expect(shouldScrollTable(layout.totalWidth, layout.assignableWidth)).toBe(
      false
    );
    expect(renderedCellStyle(layout, 0)).toMatchObject({
      borderLeftWidth: 0,
      borderRightWidth: 0
    });
  });

  it('still reserves both cell borders in separate mode', () => {
    const layout = layoutFor(
      '<table><tr><td style="border:10px solid black;padding:0">A</td></tr></table>'
    );
    expect(layout.horizontalInsets).toBe(0);
    expect(layout.totalWidth).toBeCloseTo(29.1);
  });

  it.each([
    [{ padding: 8 }, 16],
    [{ paddingHorizontal: 8 }, 16],
    [{ paddingLeft: 8 }, 9],
    [{ padding: 0 }, 0],
    [{ paddingStart: 8 }, 8],
    [{ padding: 8, paddingLeft: 2 }, 10],
    [{ padding: 8, borderWidth: 3 }, 22]
  ] as [ViewStyle, number][])(
    'measures callback style %j and reuses it in renderer props',
    (style, insets) => {
      const getStyleForCell = jest.fn(() => style);
      const layout = layoutFor('<table><tr><td>A</td></tr></table>', {
        getStyleForCell
      });
      expect(layout.totalWidth).toBeCloseTo(9.1 + insets);
      expect(renderedCellStyle(layout, 0)).toMatchObject(style);
      expect(getStyleForCell).toHaveBeenCalledTimes(1);
    }
  );

  it('lets callback shorthands override source longhands in measurement and renderer props', () => {
    const layout = layoutFor(
      '<table><tr><td style="padding-left:4px">A</td></tr></table>',
      {
        getStyleForCell: () => ({ padding: 8 })
      }
    );
    expect(layout.totalWidth).toBeCloseTo(9.1 + 8 + 8);
    expect(renderedCellStyle(layout, 0)).toMatchObject({
      paddingLeft: 8,
      padding: 8
    });
  });

  it('uses callback borders for both outer and neighbouring collapsed edges', () => {
    const getStyleForCell = jest.fn((cell) =>
      cell.x === 1 ? { borderWidth: 5, borderColor: 'red' } : null
    );
    const layout = layoutFor(
      '<table style="border-collapse:collapse"><tr><td>A</td><td>B</td></tr></table>',
      { getStyleForCell }
    );
    expect(layout.horizontalInsets).toBe(5);
    expect(layout.totalWidth).toBeCloseTo(2 * 11.1 + 5);
    expect(renderedCellStyle(layout, 0)).toMatchObject({
      borderRightWidth: 5,
      borderRightColor: 'red'
    });
    expect(renderedCellStyle(layout, 1)).toMatchObject({
      borderLeftWidth: 0,
      borderRightWidth: 0
    });
    expect(getStyleForCell).toHaveBeenCalledTimes(2);
  });

  it('allows a callback to remove source borders before resolving the wrapper', () => {
    const layout = layoutFor(
      '<table style="border-collapse:collapse"><tr><td style="border:10px solid black">A</td></tr></table>',
      {
        getStyleForCell: () => ({
          borderLeftWidth: 0,
          borderRightWidth: 0,
          borderTopWidth: 0,
          borderBottomWidth: 0
        })
      }
    );
    expect(layout.horizontalInsets).toBe(0);
    expect(layout.totalWidth).toBeCloseTo(11.1);
  });

  it('freezes width-dependent callback results instead of oscillating', () => {
    const getStyleForCell = jest.fn((cell) => ({
      padding: cell.width < 20 ? 10 : 0
    }));
    const layout = layoutFor('<table><tr><td>A</td></tr></table>', {
      getStyleForCell
    });
    expect(getStyleForCell.mock.calls[0]![0].width).toBeCloseTo(11.1);
    expect(layout.totalWidth).toBeCloseTo(29.1);
    expect(renderedCellStyle(layout, 0).padding).toBe(10);
    expect(getStyleForCell).toHaveBeenCalledTimes(1);
  });

  it('scrolls when callback padding makes content exceed available space', () => {
    const layout = layoutFor('<table><tr><td>A</td></tr></table>', {
      contentWidth: 20,
      getStyleForCell: () => ({ padding: 8 })
    });
    expect(shouldScrollTable(layout.totalWidth, layout.assignableWidth)).toBe(
      true
    );
  });
});

describe('cell percentage distribution', () => {
  it.each(['style="width:80%"', 'width="80%"'])(
    'reconciles %s like column percentages',
    (declaration) => {
      const cells = layoutFor(
        `<table><tr><td ${declaration}>A</td><td ${declaration}>B</td></tr></table>`
      );
      const columns = layoutFor(
        `<table><colgroup><col ${declaration}><col ${declaration}></colgroup><tr><td>A</td><td>B</td></tr></table>`
      );
      expect(cells.columnWidths).toEqual(columns.columnWidths);
      expect(cells.totalWidth).toBeCloseTo(100);
    }
  );

  it('keeps unbreakable content as a floor even when percentages cannot fit', () => {
    const layout = layoutFor(
      '<table><tr><td style="width:80%">AAAAAAAAAAAA</td><td style="width:80%">B</td></tr></table>'
    );
    expect(layout.columnWidths[0]).toBeCloseTo(12 * 9.1 + 2);
    expect(shouldScrollTable(layout.totalWidth, layout.assignableWidth)).toBe(
      true
    );
  });

  it('merges percentages across rows with a maximum', () => {
    const layout = layoutFor(
      '<table><tr><td width="60%">A</td><td>B</td></tr><tr><td width="80%">C</td><td>D</td></tr></table>'
    );
    expect(layout.columnWidths[0]).toBeCloseTo(80);
  });

  it('splits a colspan percentage across its columns', () => {
    const layout = layoutFor(
      '<table><tr><td colspan="2" width="80%">A</td><td>B</td></tr><tr><td>C</td><td>D</td><td>E</td></tr></table>'
    );
    expect(layout.columnWidths).toEqual([40, 40, 11.1]);
  });

  it('retains absolute column floors when a cell contributes a percentage', () => {
    const layout = layoutFor(
      '<table><colgroup><col width="70"><col></colgroup><tr><td width="50%">A</td><td>B</td></tr></table>'
    );
    expect(layout.columnWidths[0]).toBe(70);
  });

  it('honours CSS auto over a percentage attribute', () => {
    const layout = layoutFor(
      '<table><tr><td width="80%" style="width:auto">A</td><td>B</td></tr></table>'
    );
    expect(layout.totalWidth).toBeCloseTo(22.2);
  });
});
