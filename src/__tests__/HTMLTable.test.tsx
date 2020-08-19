import React from 'react';
import { StyleSheet } from 'react-native';
import validator from 'html-validator';
import { HTMLTable } from '../HTMLTable';
import { render } from '@testing-library/react-native';
import WebView from 'react-native-webview';
import Ersatz from '@formidable-webview/ersatz';
import makeErsatzTesting from '@formidable-webview/ersatz-testing';
import { TableConfig, HTMLTableStats, TableHeightState } from '../types';
import './setup';

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

const MATCH_STATE_UNDETERMINATED = {
  asymmetricMatch: (obj: TableHeightState) =>
    obj &&
    obj.type === 'undeterminated' &&
    typeof obj.heuristicHeight === 'number'
};

const MATCH_STATE_DETERMINATED = {
  asymmetricMatch: (obj: TableHeightState) =>
    obj &&
    obj.type === 'determinated' &&
    typeof obj.scrollableHeight === 'number'
};

describe('HTMLTable component', () => {
  it('should produce w3-compliant HTML code', async () => {
    const { UNSAFE_getByType } = render(
      <HTMLTable
        html={'<table></table>'}
        WebView={WebView}
        renderersProps={{}}
        numOfChars={0}
        numOfColumns={0}
        numOfRows={0}
      />
    );
    const webview = UNSAFE_getByType(WebView);
    const validated = await validator({
      data: webview.props.source.html,
      format: 'json'
    });
    expect(validated).toBeValidHTML();
  });
  describe('computeContainerHeight prop', () => {
    it('should be called once when there is no DOM mounting', () => {
      const computeContainerHeight = jest.fn(() => 40);
      render(
        <HTMLTable
          html={simpleHTML}
          computeContainerHeight={computeContainerHeight}
          {...dummyStats}
          {...defaultTestConfig}
        />
      );
      expect(computeContainerHeight).toHaveBeenCalledTimes(1);
    });
    it('should be called twice when there is DOM mounting', async () => {
      const computeContainerHeight = jest.fn(() => null);
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
      expect(computeContainerHeight).toHaveBeenCalledTimes(2);
      expect(computeContainerHeight).toHaveBeenNthCalledWith(
        1,
        MATCH_STATE_UNDETERMINATED
      );
      expect(computeContainerHeight).toHaveBeenNthCalledWith(
        2,
        MATCH_STATE_DETERMINATED
      );
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
    it("should be used on first rendering cycle to determine container's height", () => {
      const computeHeuristicHeight = jest.fn(() => 2);
      const { getByTestId } = render(
        <HTMLTable
          html={simpleHTML}
          computeHeightHeuristic={computeHeuristicHeight}
          {...dummyStats}
          {...defaultTestConfig}
        />
      );
      expect(computeHeuristicHeight).toHaveBeenCalledTimes(1);
      const container = getByTestId('html-table-container');
      expect(container).toBeTruthy();
      expect(StyleSheet.flatten(container.props.style)).toMatchObject({
        height: 2
      });
    });
  });
});
