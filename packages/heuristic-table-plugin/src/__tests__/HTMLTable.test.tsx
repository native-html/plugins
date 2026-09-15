import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import HTMLTable from '../HTMLTable';
import TableLayout from '../TableLayout';
import { HeuristicTablePluginConfig, HTMLTableProps } from '../shared-types';
import { createTableTNode } from './utils';

// Inspect the real table wrapper and scroll container independently of cell rendering.
jest.mock('../TreeRenderer', () => () => null);

function DefaultRenderer({
  children,
  style
}: PropsWithChildren<{ style: ViewStyle }>) {
  return (
    <View testID="table-wrapper" style={style}>
      {children}
    </View>
  );
}

function renderTable(
  html: string,
  contentWidth: number,
  config: Partial<HeuristicTablePluginConfig> = {}
) {
  const tnode = createTableTNode(html);
  const settings = { contentWidth, forceStretch: false };
  const layout = new TableLayout(tnode, settings);
  const props = {
    tnode,
    layout,
    settings,
    config: { ...settings, ...config },
    style: tnode.styles.nativeBlockRet,
    TDefaultRenderer: DefaultRenderer
  } as unknown as HTMLTableProps;
  return render(<HTMLTable {...props} />);
}

describe('HTMLTable containers', () => {
  it('enforces an explicit table height on the wrapper by default', () => {
    const rendered = renderTable(
      '<table style="height:48px"><tr><td>A</td></tr></table>',
      400
    );
    const wrapper = rendered.getByTestId('table-wrapper');
    expect(wrapper).toHaveStyle({ height: 48 });
    expect(StyleSheet.flatten(wrapper.props.style)).not.toHaveProperty(
      'minHeight'
    );
  });

  it('passes an explicit table height as minHeight when growBeyondHeight is set', () => {
    const rendered = renderTable(
      '<table style="height:48px"><tr><td>A</td></tr></table>',
      400,
      { growBeyondHeight: true }
    );
    const wrapper = rendered.getByTestId('table-wrapper');
    expect(wrapper).toHaveStyle({ minHeight: 48 });
    expect(StyleSheet.flatten(wrapper.props.style)).not.toHaveProperty(
      'height'
    );
  });

  it('uses the capped table width for the wrapper and overflow viewport', () => {
    const rendered = renderTable(
      '<table style="max-width:300px"><tr><td style="width:300px">A</td><td style="width:300px">B</td></tr></table>',
      600
    );
    expect(rendered.getByTestId('table-wrapper')).toHaveStyle({ width: 300 });
    const scroll = rendered.UNSAFE_getByType(ScrollView);
    expect(scroll.props.horizontal).toBe(true);
    expect(scroll.props.style).toEqual({ width: 300 });
    expect(scroll.props.contentContainerStyle).toEqual({ width: 600 });
  });

  it.each([
    [
      '<div style="width:30px"><table style="padding:40px"><tr><td>A</td></tr></table></div>',
      30
    ],
    [
      '<table style="max-width:10px;padding:20px"><tr><td>A</td></tr></table>',
      10
    ]
  ] as const)(
    'caps the wrapper style width when its insets exceed its width: %s',
    (html, width) => {
      const rendered = renderTable(html, 400);
      expect(rendered.getByTestId('table-wrapper')).toHaveStyle({ width });
      expect(rendered.UNSAFE_getByType(ScrollView).props.style).toEqual({
        width: 0
      });
    }
  );

  it('includes its own insets in the shrink-to-fit wrapper width', () => {
    const rendered = renderTable(
      '<table style="padding:10px"><tr><td style="width:100px">A</td></tr></table>',
      400
    );
    expect(rendered.getByTestId('table-wrapper')).toHaveStyle({ width: 120 });
    expect(rendered.UNSAFE_queryByType(ScrollView)).toBeNull();
  });

  it.each([100, 100.5, 101, 102])(
    'scrolls only when the %spx content exceeds the viewport by more than one pixel',
    (width) => {
      const rendered = renderTable(
        `<table><tr><td style="width:${width}px">A</td></tr></table>`,
        100
      );
      expect(rendered.UNSAFE_queryByType(ScrollView) !== null).toBe(
        width > 101
      );
    }
  );
});
