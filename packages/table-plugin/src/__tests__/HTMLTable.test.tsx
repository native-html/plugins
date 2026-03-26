import React from 'react';
import { StyleSheet } from 'react-native';
import validator from 'html-validator';
import { HTMLTable } from '../HTMLTable';
import { act, render } from '@testing-library/react-native';
import Ersatz from '@formidable-webview/ersatz';
import { waitForErsatz } from '@formidable-webview/ersatz-testing';
import { HTMLTableStats } from '../types';
import './setup';
import {
  TableConfig,
  TableContentHeightState
} from '@native-html/table-plugin';

const defaultTestConfig = {
  WebView: Ersatz,
  animationType: 'none' as TableConfig['animationType'],
  debug: false
};

const simpleHTML = `
<table>
  <tr>
    <th>Entry Header 1</th>
    <th>Entry Header 2</th>
    <th>Entry Header 3</th>
  </tr>
</table>
`;

const dummyStats: HTMLTableStats = {
  numOfChars: 200,
  numOfColumns: 1,
  numOfRows: 2
};

function waitForRender(timeMs: number = 1000) {
  // eslint-disable-next-line compat/compat
  return act(() => new Promise((res) => setTimeout(res, timeMs)));
}

// We have to exclude those tests until an upstream bug in jest
// regarding forwarded ref components is fixed.
// See https://github.com/callstack/react-native-testing-library/issues/539
describe('HTMLTable component', () => {
  it('should produce w3-compliant HTML code', async () => {
    const webview = await waitForErsatz(
      render(<HTMLTable html={simpleHTML} WebView={Ersatz} {...dummyStats} />)
    );
    const validated = await validator({
      data: webview.props.source.html,
      format: 'json'
    });
    expect(validated).toBeValidHTML();
    await waitForRender();
  });

  describe('computeContainerHeight prop', () => {
    it('should be called three times when there is DOM mounting', async () => {
      const computeContainerHeight = jest.fn((s: TableContentHeightState) => {
        return s.contentHeight;
      });
      await waitForErsatz(
        render(
          <HTMLTable
            html={simpleHTML}
            computeContainerHeight={computeContainerHeight}
            {...dummyStats}
            {...defaultTestConfig}
          />
        )
      );
      expect(computeContainerHeight).toHaveBeenCalledTimes(3);
      expect(computeContainerHeight).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: 'heuristic',
          contentHeight: expect.any(Number)
        })
      );
      expect(computeContainerHeight).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          type: 'accurate',
          contentHeight: expect.any(Number)
        })
      );
    });
    it("should be used to set container's height", async () => {
      const { getByTestId, findByTestId } = render(
        <HTMLTable
          html={simpleHTML}
          computeContainerHeight={() => 40}
          {...dummyStats}
          {...defaultTestConfig}
        />
      );
      await findByTestId('backend-loaded-0');
      const container = getByTestId('html-table-container');
      expect(container).toBeTruthy();
      expect(StyleSheet.flatten(container.props.style)).toMatchObject({
        height: 40
      });
      await waitForRender();
    });
  });
  describe('computeHeuristicHeight prop', () => {
    it("should be used on two initial rendering cycles to determine container's height", async () => {
      const computeHeuristicContentHeight = jest.fn(() => 2);
      const { getByTestId, findByTestId } = render(
        <HTMLTable
          html={simpleHTML}
          computeHeuristicContentHeight={computeHeuristicContentHeight}
          {...dummyStats}
          {...defaultTestConfig}
        />
      );
      expect(computeHeuristicContentHeight).toHaveBeenCalledTimes(2);
      const container = getByTestId('html-table-container');
      expect(container).toBeTruthy();
      expect(StyleSheet.flatten(container.props.style)).toMatchObject({
        height: 2
      });
      await findByTestId('backend-loaded-0');
      await waitForRender();
    });
  });
});
