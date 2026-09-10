import { ViewStyle } from 'react-native';
import { CustomRendererProps, TBlock, TNode } from '@native-html/render';
import useHtmlTableCellProps from '../../useHtmlTableCellProps';
import { HeuristicTablePluginConfig, TableCell } from '../../shared-types';
import { createTableTNode } from './utils';

function findFirstCell(tnode: TNode): TNode | null {
  if (tnode.tagName === 'td' || tnode.tagName === 'th') {
    return tnode;
  }
  for (const child of tnode.children) {
    const cell = findFirstCell(child);
    if (cell) {
      return cell;
    }
  }
  return null;
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
  config: HeuristicTablePluginConfig = {}
): ViewStyle {
  const tnode = findFirstCell(
    createTableTNode(`<table><tr>${cellMarkup}</tr></table>`)
  );
  expect(tnode).not.toBeNull();
  const cell: TableCell = {
    type: 'cell',
    tnode: tnode as TNode,
    x: 0,
    y: 0,
    lenX: 1,
    lenY: 1,
    width: 100,
    constraints: { minWidth: 0, maxWidth: 100, contentDensity: 0 }
  };
  const props = {
    tnode,
    style: tnode?.styles.nativeBlockRet,
    propsFromParent: {
      cell,
      config,
      borderCollapse: false,
      maxX: 0,
      maxY: 0,
      tableBorderStyle: null
    }
  } as unknown as CustomRendererProps<TBlock>;
  return useHtmlTableCellProps(props).style as ViewStyle;
}

describe('useHtmlTableCellProps', () => {
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

      // No longhand may be emitted beside the config shorthand: Yoga resolves
      // a side against its own edge first, so a default of 1 would win.
      expect(style.padding).toBe(8);
      expect(style).not.toHaveProperty('paddingTop');
      expect(style).not.toHaveProperty('paddingRight');
      expect(style).not.toHaveProperty('paddingBottom');
      expect(style).not.toHaveProperty('paddingLeft');
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
});
