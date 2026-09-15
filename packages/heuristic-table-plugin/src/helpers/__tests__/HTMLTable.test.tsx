import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import { ScrollView, View, ViewStyle } from 'react-native';
import HTMLTable from '../../HTMLTable';
import TableLayout from '../../TableLayout';
import { HTMLTableProps } from '../../shared-types';
import { createTableTNode } from './utils';

// Inspect the real table wrapper and scroll container independently of cell rendering.
jest.mock('../../TreeRenderer', () => () => null);

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

function renderTable(html: string, contentWidth: number) {
  const tnode = createTableTNode(html);
  const settings = { contentWidth, forceStretch: false };
  const layout = new TableLayout(tnode, settings);
  const props = {
    tnode,
    layout,
    settings,
    config: settings,
    style: tnode.styles.nativeBlockRet,
    TDefaultRenderer: DefaultRenderer
  } as unknown as HTMLTableProps;
  return render(<HTMLTable {...props} />);
}

describe('HTMLTable containers', () => {
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
    'clamps the painted wrapper when its insets exceed its width: %s',
    (html, width) => {
      const rendered = renderTable(html, 400);
      expect(rendered.getByTestId('table-wrapper')).toHaveStyle({ width });
      expect(rendered.UNSAFE_getByType(ScrollView).props.style).toEqual({
        width: 0
      });
    }
  );

  it('paints a shrink-to-fit wrapper with its own insets', () => {
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
