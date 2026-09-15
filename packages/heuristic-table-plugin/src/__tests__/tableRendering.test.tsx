import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, ViewStyle } from 'react-native';
import RenderHTML, { CustomBlockRenderer } from '@native-html/render';
import renderers from '../index';
import { TableCell } from '../shared-types';
import HTMLTable from '../HTMLTable';
import TableLayout from '../TableLayout';
import { getHorizontalInsets } from '../helpers/measure';
import { DEFAULT_FONT_WEIGHT_COEFFS } from '../helpers/TCellConstraintsComputer';
import useHtmlTableProps from '../useHtmlTableProps';

afterEach(() => jest.restoreAllMocks());

describe.each([true, false])(
  'callback padding with user-agent styles %s',
  (enableUserAgentStyles) => {
    it.each([
      [{ padding: 8 }, '', 8, 8],
      [{ paddingHorizontal: 8 }, '', 8, 8],
      [{ padding: 0 }, '', 0, 0],
      [{ padding: 8, paddingLeft: 3 }, '', 3, 8],
      [{ padding: 8 }, 'padding-left:4px', 8, 8],
      [{ paddingVertical: 8 }, 'padding-left:3px;padding-right:5px', 3, 5]
    ] as [ViewStyle, string, number, number][])(
      'measures and renders %j over source %s',
      (padding, sourceStyle, left, right) => {
        const getStyleForCell = jest.fn(() => padding);
        const rendered = render(
          <RenderHTML
            enableUserAgentStyles={enableUserAgentStyles}
            contentWidth={100}
            source={{
              html: `<table style="font-size:20px"><tr><td style="${sourceStyle}">A</td></tr></table>`
            }}
            renderers={renderers}
            renderersProps={{
              table: {
                forceStretch: false,
                baseFontCoeff: 0.5,
                getStyleForCell
              }
            }}
          />
        );
        const cell = rendered.getByTestId('td');
        const width = 10 + left + right;
        expect(cell).toHaveStyle({
          paddingLeft: left,
          paddingRight: right,
          width
        });
        if (padding.paddingVertical != null) {
          expect(cell).toHaveStyle({ paddingTop: 8, paddingBottom: 8 });
        }
        let wrapper = cell.parent;
        while (wrapper && typeof wrapper.type !== 'string')
          wrapper = wrapper.parent;
        expect(StyleSheet.flatten(wrapper!.props.style).width).toBe(width);
        expect(getStyleForCell).toHaveBeenCalledTimes(1);
      }
    );
  }
);

describe('user-agent cell styles', () => {
  function cellStyles(html: string, enableUserAgentStyles?: boolean) {
    const rendered = render(
      <RenderHTML
        {...(enableUserAgentStyles === undefined
          ? null
          : { enableUserAgentStyles })}
        contentWidth={200}
        source={{ html }}
        renderers={renderers}
        renderersProps={{ table: { forceStretch: false, baseFontCoeff: 0.5 } }}
      />
    );
    const styleOf = (testID: string) =>
      StyleSheet.flatten(rendered.getByTestId(testID).props.style);
    return { td: styleOf('td'), th: styleOf('th') };
  }

  const HEADED = '<table><tr><th>MMMM</th><td>MMMM</td></tr></table>';
  // Four characters of the default 14px text at the pinned 0.5 coefficient.
  const TEXT_WIDTH = 4 * 14 * 0.5;

  // `th` is bold in the user-agent stylesheet, so every header cell of every
  // default-configured table is measured through the font-weight coefficients
  // — the one production path that reaches them without an author saying so.
  it.each([undefined, true])(
    'measures a bold th wider than a td with enableUserAgentStyles %s',
    (enableUserAgentStyles) => {
      const { td, th } = cellStyles(HEADED, enableUserAgentStyles);
      // The engine's user-agent sheet pads a cell by 2px on each side, which
      // is what ships: the plugin's own 1px default only fills sides that
      // sheet leaves bare, and here it leaves none.
      expect(td).toMatchObject({ paddingLeft: 2, paddingRight: 2 });
      expect(th).toMatchObject({ paddingLeft: 2, paddingRight: 2 });
      expect(td.width).toBeCloseTo(TEXT_WIDTH + 4);
      expect(th.width).toBeCloseTo(
        TEXT_WIDTH * DEFAULT_FONT_WEIGHT_COEFFS.bold! + 4
      );
      expect(th.width).toBeGreaterThan(td.width);
    }
  );

  it('measures th and td alike when user-agent styles are off', () => {
    // Nothing declares a weight now, so the header loses its bold coefficient
    // and both cells fall back to the plugin's own 1px of padding.
    const { td, th } = cellStyles(HEADED, false);
    expect(td).toMatchObject({ paddingLeft: 1, paddingRight: 1 });
    expect(th).toMatchObject({ paddingLeft: 1, paddingRight: 1 });
    expect(th.width).toBeCloseTo(TEXT_WIDTH + 2);
    expect(th.width).toBe(td.width);
  });
});

describe('nested tables', () => {
  // `getStyleForCell` gives every cell 4px of padding and a 2px border on each
  // side. The outer first cell is at x=0 of two columns, so collapsing hands
  // its leading edge to the table wrapper and leaves the trailing one to it:
  // 4 + 4 of padding, 0 of left border and 2 of right.
  const CELL_HORIZONTAL_INSETS = 4 + 4 + 0 + 2;

  it.each([0, 10])(
    'sizes nested tables inside their assigned cell and %spx wrapper padding',
    (padding) => {
      const source = {
        html: `<table id="outer"><tr><td><div style="padding:${padding}px"><table id="inner"><tr><td>A</td></tr></table></div></td><td>B</td></tr></table>`
      };
      const layouts = new Map<string, TableLayout>();
      const TableRenderer: CustomBlockRenderer = (props) => {
        const tableProps = useHtmlTableProps(props);
        layouts.set(props.tnode.attributes.id!, tableProps.layout);
        return <HTMLTable {...tableProps} />;
      };
      const testRenderers = { ...renderers, table: TableRenderer };
      const getStyleForCell = () => ({ padding: 4, borderWidth: 2 });
      const view = (contentWidth: number) => (
        <RenderHTML
          contentWidth={contentWidth}
          source={source}
          renderers={testRenderers}
          renderersProps={{
            table: { getStyleForCell, borderCollapse: 'collapse' }
          }}
        />
      );
      // RenderHTML warns in dev when its props change less than 60ms apart, and
      // the deliberate rerender below is immediate. Pinning the clock and moving
      // it on by a second per prop change keeps that warning out of the output.
      const now = jest.spyOn(performance, 'now').mockReturnValue(1000);
      const rendered = render(view(400));
      const checkWidths = () => {
        const outer = layouts.get('outer');
        const inner = layouts.get('inner');
        const parent = outer!.cells[0]!;
        // The measurement pass and the cell renderer merge the source, config
        // and collapsed styles in two separate places. Both are pinned to the
        // same hand-computed insets: reading the expectation back out of the
        // layout would let the two drift together undetected, and a nested
        // table would then be sized against a box its cell does not have.
        expect(
          getHorizontalInsets(outer!.cellStyles.get(parent.tnode)!.style)
        ).toBe(CELL_HORIZONTAL_INSETS);
        expect(
          getHorizontalInsets(
            StyleSheet.flatten(rendered.getAllByTestId('td')[0]!.props.style)
          )
        ).toBe(CELL_HORIZONTAL_INSETS);
        const expected = parent.width - CELL_HORIZONTAL_INSETS - 2 * padding;
        expect(inner!.availableWidth).toBeCloseTo(expected);
        expect(inner!.usedWidth).toBeCloseTo(expected);
        return expected;
      };
      const initialWidth = checkWidths();
      now.mockReturnValue(2000);
      rendered.rerender(view(600));
      expect(checkWidths()).toBeGreaterThan(initialWidth);
    }
  );
});

describe('measured styles across rerenders', () => {
  it('reuses measured callback styles and relayouts when the callback changes', () => {
    const source = {
      html: '<table style="font-size:20px"><tr><td>A</td><td>B</td></tr></table>'
    };
    const first = jest.fn((cell: TableCell) => ({
      paddingLeft: cell.x === 0 ? 8 : 4,
      paddingRight: cell.x === 0 ? 8 : 4
    }));
    const second = jest.fn(() => ({ paddingLeft: 12, paddingRight: 12 }));
    const view = (getStyleForCell: typeof first | typeof second) => (
      <RenderHTML
        contentWidth={100}
        source={source}
        renderers={renderers}
        renderersProps={{
          table: {
            forceStretch: false,
            baseFontCoeff: 0.5,
            borderCollapse: 'collapse',
            getStyleForCell
          }
        }}
      />
    );
    // Advance RenderHTML's profiler clock between the intentional prop changes
    // below, which would otherwise be warned about as accidental rerenders.
    const now = jest.spyOn(performance, 'now');
    now.mockReturnValue(1000);
    const rendered = render(view(first));
    const expectCellStyles = (paddings: number[], widths: number[]) => {
      const cells = rendered.getAllByTestId('td');
      expect(cells).toHaveLength(2);
      cells.forEach((cell, index) => {
        expect(cell).toHaveStyle({
          paddingLeft: paddings[index],
          paddingRight: paddings[index],
          width: widths[index]
        });
        // Skip composite components to inspect TreeRenderer's surrounding native
        // View as well as the cell itself. Both must receive the measured width.
        let wrapper = cell.parent;
        while (wrapper && typeof wrapper.type !== 'string')
          wrapper = wrapper.parent;
        expect(wrapper).not.toBeNull();
        expect(StyleSheet.flatten(wrapper!.props.style).width).toBe(
          widths[index]
        );
      });
    };
    // 20px text at the pinned 0.5 coefficient is 10px for the single
    // character of each cell, plus the padding the callback declares.
    expectCellStyles([8, 4], [10 + 8 + 8, 10 + 4 + 4]);
    expect(rendered.queryByText('A')).not.toBeNull();
    expect(rendered.queryByText('B')).not.toBeNull();
    expect(first).toHaveBeenCalledTimes(2);
    now.mockReturnValue(2000);
    rendered.rerender(view(first));
    expect(first).toHaveBeenCalledTimes(2);
    expectCellStyles([8, 4], [10 + 8 + 8, 10 + 4 + 4]);
    now.mockReturnValue(3000);
    rendered.rerender(view(second));
    now.mockRestore();
    expectCellStyles([12, 12], [10 + 12 + 12, 10 + 12 + 12]);
    expect(second).toHaveBeenCalledTimes(2);
    expect(first).toHaveBeenCalledTimes(2);
  });
});
