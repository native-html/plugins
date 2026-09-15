import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, ViewStyle } from 'react-native';
import RenderHTML, { CustomBlockRenderer } from '@native-html/render';
import renderers from '../../index';
import { TableCell } from '../../shared-types';
import HTMLTable from '../../HTMLTable';
import TableLayout from '../../TableLayout';
import { getHorizontalInsets } from '../measure';
import useHtmlTableProps from '../../useHtmlTableProps';

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
      const expected =
        parent.width -
        getHorizontalInsets(outer!.cellStyles.get(parent.tnode)!.style) -
        2 * padding;
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

it('reuses measured callback styles while rendering and relayouts when the callback changes', () => {
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
  expectCellStyles([8, 4], [26, 18]);
  expect(rendered.getByText('A')).toBeTruthy();
  expect(rendered.getByText('B')).toBeTruthy();
  expect(first).toHaveBeenCalledTimes(2);
  now.mockReturnValue(2000);
  rendered.rerender(view(first));
  expect(first).toHaveBeenCalledTimes(2);
  expectCellStyles([8, 4], [26, 18]);
  now.mockReturnValue(3000);
  rendered.rerender(view(second));
  now.mockRestore();
  expectCellStyles([12, 12], [34, 34]);
  expect(second).toHaveBeenCalledTimes(2);
  expect(first).toHaveBeenCalledTimes(2);
});
