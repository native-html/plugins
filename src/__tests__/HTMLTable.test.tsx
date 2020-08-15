import React from 'react';
import validator from 'html-validator';
import { HTMLTable } from '../HTMLTable';
import { render } from '@testing-library/react-native';
import WebView from 'react-native-webview';
import './setup';

describe('HTMLTable component', () => {
  it('should produce w3-compliant HTML code', async () => {
    const { UNSAFE_getByType } = render(
      <HTMLTable
        html={'<table></table>'}
        WebViewComponent={WebView}
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
});
