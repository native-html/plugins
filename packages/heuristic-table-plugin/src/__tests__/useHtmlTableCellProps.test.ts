import { ViewStyle } from 'react-native';
import { CustomRendererProps, TBlock } from '@native-html/render';
import useHtmlTableCellProps from '../useHtmlTableCellProps';
import { HeuristicTablePluginConfig, TableCell } from '../shared-types';
import { createCellTNode } from './utils';

/**
 * Where the cell sits in the matrix, and how the table collapses its borders.
 *
 * @remarks
 * Only a consumer writing its own `td` renderer reaches this shape:
 * `TreeRenderer` always hands down a `resolvedCellStyle` it measured against,
 * and the hook then reuses that instead of resolving anything here. The
 * defaults keep the cell the sole one of a separate-border table.
 */
interface CellContext {
  borderCollapse?: boolean;
  x?: number;
  y?: number;
  maxX?: number;
  maxY?: number;
  tableBorderStyle?: ViewStyle | null;
}

/**
 * The style the cell renderer hands to the default renderer for the first cell
 * of `cellMarkup`.
 *
 * @remarks
 * `useHtmlTableCellProps` calls no React hook, so it is exercised as the plain
 * function it is. Everything the props carry beyond the fields it reads is
 * irrelevant to the style it resolves.
 */
function cellStyleFor(
  cellMarkup: string,
  config: HeuristicTablePluginConfig = {},
  {
    borderCollapse = false,
    x = 0,
    y = 0,
    maxX = 0,
    maxY = 0,
    tableBorderStyle = null
  }: CellContext = {}
): ViewStyle {
  const tnode = createCellTNode(`<table><tr>${cellMarkup}</tr></table>`);
  const cell: TableCell = {
    type: 'cell',
    tnode,
    x,
    y,
    lenX: 1,
    lenY: 1,
    width: 100,
    constraints: { minWidth: 0, maxWidth: 100, contentDensity: 0 }
  };
  const props = {
    tnode,
    style: tnode.styles.nativeBlockRet,
    propsFromParent: {
      cell,
      config,
      borderCollapse,
      maxX,
      maxY,
      tableBorderStyle
    }
  } as unknown as CustomRendererProps<TBlock>;
  return useHtmlTableCellProps(props).style as ViewStyle;
}

describe('useHtmlTableCellProps', () => {
  it.each(['td', 'th'])('enforces an explicit %s height by default', (tag) => {
    const style = cellStyleFor(`<${tag} style="height:48px">A</${tag}>`);
    expect(style.height).toBe(48);
    expect(style).not.toHaveProperty('minHeight');
  });

  it.each(['td', 'th'])(
    'passes an explicit %s height as minHeight when growBeyondHeight is set',
    (tag) => {
      const style = cellStyleFor(`<${tag} style="height:48px">A</${tag}>`, {
        growBeyondHeight: true
      });
      expect(style.minHeight).toBe(48);
      expect(style).not.toHaveProperty('height');
    }
  );

  it.each([
    ['top', 'flex-start'],
    ['baseline', 'flex-start'],
    ['middle', 'center'],
    ['bottom', 'flex-end']
  ])('maps vertical-align:%s to justifyContent:%s', (alignment, expected) => {
    expect(
      cellStyleFor(`<td style="vertical-align:${alignment}">A</td>`)
        .justifyContent
    ).toBe(expected);
  });

  it('keeps explicit justify-content when vertical-align is absent', () => {
    expect(
      cellStyleFor('<td style="justify-content:flex-end">A</td>').justifyContent
    ).toBe('flex-end');
  });

  it('lets explicit vertical-align override justify-content', () => {
    expect(
      cellStyleFor(
        '<td style="vertical-align:top;justify-content:flex-end">A</td>'
      ).justifyContent
    ).toBe('flex-start');
  });

  describe('default padding', () => {
    it('pads a bare cell by one pixel, as HTML does', () => {
      expect(cellStyleFor('<td>A</td>')).toMatchObject({
        paddingTop: 1,
        paddingRight: 1,
        paddingBottom: 1,
        paddingLeft: 1
      });
    });

    it('yields the sides the cell CSS declares', () => {
      expect(cellStyleFor('<td style="padding: 8px">A</td>')).toMatchObject({
        paddingTop: 8,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 8
      });
    });

    it('keeps the default on the sides that CSS leaves out', () => {
      expect(
        cellStyleFor('<td style="padding-left: 8px">A</td>')
      ).toMatchObject({
        paddingTop: 1,
        paddingRight: 1,
        paddingBottom: 1,
        paddingLeft: 8
      });
    });

    it('honours a padding the config declares', () => {
      const style = cellStyleFor('<td>A</td>', {
        getStyleForCell: () => ({ padding: 8 })
      });

      expect(style).toMatchObject({
        padding: 8,
        paddingTop: 8,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 8
      });
    });

    it('leaves a cell asking for no padding unpadded', () => {
      expect(cellStyleFor('<td style="padding: 0">A</td>')).toMatchObject({
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: 0,
        paddingLeft: 0
      });
    });
  });

  // The hook resolves the collapsing model itself only when no
  // `resolvedCellStyle` reaches it, which `TreeRenderer` always supplies. This
  // is therefore the path of a consumer rendering its own `td`, and the one
  // branch of the hook the in-tree renderers never take.
  describe('collapsing borders without a resolved style', () => {
    const BORDERED = '<td style="border: 2px solid black">A</td>';

    it('leaves the borders of a separate-border cell alone', () => {
      expect(cellStyleFor(BORDERED)).toMatchObject({
        borderLeftWidth: 2,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderBottomWidth: 2
      });
    });

    it('drops the duplicated leading and top edges of an interior cell', () => {
      expect(
        cellStyleFor(
          BORDERED,
          {},
          {
            borderCollapse: true,
            x: 1,
            y: 1,
            maxX: 2,
            maxY: 2
          }
        )
      ).toMatchObject({
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderRightWidth: 2,
        borderBottomWidth: 2
      });
    });

    it('weighs a border the cell only gets from the config', () => {
      // Resolving against the source CSS alone would find no border here and
      // strip the one `getStyleForCell` declares, leaving nothing to paint it.
      expect(
        cellStyleFor(
          '<td>A</td>',
          { getStyleForCell: () => ({ borderWidth: 3, borderColor: 'red' }) },
          { borderCollapse: true, x: 0, y: 0, maxX: 1, maxY: 0 }
        )
      ).toMatchObject({
        borderRightWidth: 3,
        borderRightColor: 'red'
      });
    });

    it('yields an outer edge to a table wrapper that paints it', () => {
      expect(
        cellStyleFor(
          BORDERED,
          {},
          {
            borderCollapse: true,
            tableBorderStyle: {
              borderTopWidth: 2,
              borderRightWidth: 2,
              borderBottomWidth: 2,
              borderLeftWidth: 2
            }
          }
        )
      ).toMatchObject({
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0
      });
    });
  });
});
