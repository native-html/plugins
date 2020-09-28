import React from 'react';
import { StyleSheet } from 'react-native';
import validator from 'html-validator';
import { HTMLTable } from '../HTMLTable';
import { render } from '@testing-library/react-native';
import WebView from 'react-native-webview';
import Ersatz from '@formidable-webview/ersatz';
import makeErsatzTesting from '@formidable-webview/ersatz-testing';
import { TableConfig, HTMLTableStats } from '../types';
import './setup';
import { TableContentHeightState } from '@native-html/table-plugin';

const { waitForErsatz } = makeErsatzTesting(Ersatz);

const defaultTestConfig: TableConfig = {
  WebView,
  animationType: 'none'
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

describe('HTMLTable component', () => {
  it('should produce w3-compliant HTML code', async () => {
    const webview = await waitForErsatz(
      render(
        <HTMLTable
          html={'<table></table>'}
          WebView={Ersatz}
          renderersProps={{}}
          numOfChars={0}
          numOfColumns={0}
          numOfRows={0}
        />
      )
    );
    const validated = await validator({
      data: webview.props.source.html,
      format: 'json'
    });
    expect(validated).toBeValidHTML();
  });
  describe('computeContainerHeight prop', () => {
    it('should be called twice when there is no DOM mounting', () => {
      const computeContainerHeight = jest.fn(() => 40);
      render(
        <HTMLTable
          html={simpleHTML}
          computeContainerHeight={computeContainerHeight}
          {...dummyStats}
          {...defaultTestConfig}
        />
      );
      expect(computeContainerHeight).toHaveBeenCalledTimes(2);
    });
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
            WebView={Ersatz}
          />
        )
      );
      expect(computeContainerHeight).toHaveBeenCalledTimes(3);
      expect(computeContainerHeight).toHaveBeenNthCalledWith(1, {
        type: 'heuristic',
        contentHeight: expect.any(Number)
      });
      expect(computeContainerHeight).toHaveBeenNthCalledWith(3, {
        type: 'accurate',
        contentHeight: expect.any(Number)
      });
    });
    it("should be used to set container's height", () => {
      const { getByTestId } = render(
        <HTMLTable
          html={simpleHTML}
          computeContainerHeight={() => 40}
          {...dummyStats}
          {...defaultTestConfig}
        />
      );
      const container = getByTestId('html-table-container');
      expect(container).toBeTruthy();
      expect(StyleSheet.flatten(container.props.style)).toMatchObject({
        height: 40
      });
    });
  });
  describe('computeHeuristicHeight prop', () => {
    it("should be used on two initial rendering cycles to determine container's height", () => {
      const computeHeuristicContentHeight = jest.fn(() => 2);
      const { getByTestId } = render(
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
    });
  });
});
