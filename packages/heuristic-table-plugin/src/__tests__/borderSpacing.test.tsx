import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';
import RenderHTML from '@native-html/render';
import renderers from '../index';
import TableLayout from '../TableLayout';
import resolveBorderSpacing from '../helpers/resolveBorderSpacing';
import { createTableTNode } from './utils';

describe('border spacing', () => {
  it.each([
    ['border-spacing:8px 12px', 8, 12],
    ['border-spacing:5px', 5, 5],
    ['border-spacing:0', 0, 0],
    ['border-spacing:-1px', 0, 0],
    ['border-spacing:10%', 0, 0],
    ['border-spacing:1px 2px 3px', 0, 0],
    ['font-size:20px;border-spacing:0.5em 1em', 10, 20]
  ])('resolves %s', (style, horizontal, vertical) => {
    const table = createTableTNode(
      `<table style="${style}"><tr><td>A</td></tr></table>`
    );
    expect(resolveBorderSpacing(table, false)).toEqual({
      horizontal,
      vertical
    });
    expect(resolveBorderSpacing(table, true)).toEqual({
      horizontal: 0,
      vertical: 0
    });
  });

  it('supports inherited spacing and the legacy cellspacing attribute', () => {
    const inherited = createTableTNode(
      '<div style="border-spacing:8px 12px"><table><tr><td>A</td></tr></table></div>'
    );
    expect(resolveBorderSpacing(inherited, false)).toEqual({
      horizontal: 8,
      vertical: 12
    });
    const legacy = createTableTNode(
      '<table cellspacing="6"><tr><td>A</td></tr></table>'
    );
    expect(resolveBorderSpacing(legacy, false)).toEqual({
      horizontal: 6,
      vertical: 6
    });
    const override = createTableTNode(
      '<table cellspacing="6" style="border-spacing:0"><tr><td>A</td></tr></table>'
    );
    expect(resolveBorderSpacing(override, false)).toEqual({
      horizontal: 0,
      vertical: 0
    });
  });

  it('reserves gaps inside the table width and includes internal gaps in colspan widths', () => {
    const table = createTableTNode(
      '<table style="width:300px;border-spacing:8px 12px"><tr><td>A</td><td>B</td></tr><tr><td colspan="2">C</td></tr></table>'
    );
    const layout = new TableLayout(table, { contentWidth: 300 });
    expect(layout.totalWidth).toBeCloseTo(300);
    expect(layout.columnWidths.reduce((a, b) => a + b, 0)).toBeCloseTo(276);
    expect(layout.cells[2].width).toBeCloseTo(284);
    const collapsed = new TableLayout(table, {
      contentWidth: 300,
      borderCollapse: 'collapse'
    });
    expect(collapsed.cells[2].width).toBeCloseTo(300);
  });

  it('includes spacing when content overflows', () => {
    const table = createTableTNode(
      '<table style="border-spacing:8px"><tr><td style="width:200px;padding:0">A</td><td style="width:200px;padding:0">B</td></tr></table>'
    );
    const layout = new TableLayout(table, { contentWidth: 300 });
    expect(layout.totalWidth).toBe(424);
    expect(layout.assignableWidth).toBe(300);
  });

  it('paints gaps outside cells and only once around the grid', () => {
    const rendered = render(
      <RenderHTML
        contentWidth={300}
        renderers={renderers}
        source={{
          html: '<table style="border-spacing:8px 12px"><tr><td>A</td><td>B</td></tr><tr><td colspan="2">C</td></tr></table>'
        }}
      />
    );
    const styles = rendered
      .UNSAFE_getAllByType(View)
      .map((view) => StyleSheet.flatten(view.props.style));
    expect(
      styles.filter(
        (style) =>
          style?.paddingHorizontal === 8 && style?.paddingVertical === 12
      )
    ).toHaveLength(1);
    expect(
      styles.filter(
        (style) => style?.marginEnd === 8 && style?.marginBottom === 12
      )
    ).toHaveLength(1);
    expect(
      styles.filter(
        (style) => style?.marginEnd === 0 && style?.marginBottom === 12
      )
    ).toHaveLength(1);
    expect(
      styles.filter(
        (style) => style?.marginEnd === 0 && style?.marginBottom === 0
      )
    ).toHaveLength(1);
  });
});
