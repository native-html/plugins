import React from 'react';
import { render } from '@testing-library/react-native';
import RenderHTML from '@native-html/render';
import renderers from '../../index';
import { TableCell } from '../../shared-types';

afterEach(() => jest.restoreAllMocks());

it('reuses measured callback styles while rendering and relayouts when the callback changes', () => {
  const source = { html: '<table><tr><td>A</td><td>B</td></tr></table>' };
  const first = jest.fn((cell: TableCell) => ({
    padding: cell.x === 0 ? 8 : 4
  }));
  const second = jest.fn(() => ({ padding: 12 }));
  const view = (getStyleForCell: typeof first | typeof second) => (
    <RenderHTML
      contentWidth={100}
      source={source}
      renderers={renderers}
      renderersProps={{
        table: {
          forceStretch: false,
          borderCollapse: 'collapse',
          getStyleForCell
        }
      }}
    />
  );
  // Advance the profiler clock between intentional prop changes.
  const now = jest.spyOn(performance, 'now');
  now.mockReturnValue(1000);
  const rendered = render(view(first));
  expect(rendered.getByText('A')).toBeTruthy();
  expect(rendered.getByText('B')).toBeTruthy();
  expect(first).toHaveBeenCalledTimes(2);
  now.mockReturnValue(2000);
  rendered.rerender(view(first));
  expect(first).toHaveBeenCalledTimes(2);
  now.mockReturnValue(3000);
  rendered.rerender(view(second));
  now.mockRestore();
  expect(second).toHaveBeenCalledTimes(2);
  expect(first).toHaveBeenCalledTimes(2);
});
