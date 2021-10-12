import React from 'react';
import HTML, { RenderHTMLProps } from 'react-native-render-html';
import renderer from 'react-test-renderer';
import WebView from 'react-native-webview';
import IframeRenderer from '../IframeRenderer';

describe('iframe renderer', () => {
  it('should render without errors', () => {
    expect(() => {
      renderer.create(
        <HTML
          WebView={WebView}
          renderers={{
            iframe: IframeRenderer
          }}
          contentWidth={10}
          source={{
            html: '<iframe width="300" height="300" src="https://google.com/" />'
          }}
        />
      );
    }).not.toThrow();
  });
  it('should support provideEmbeddedHeaders prop', () => {
    const props: RenderHTMLProps = {
      source: {
        html: '<iframe width="300" height="300" src="https://google.com/" />'
      },
      provideEmbeddedHeaders: (uri, tagName, params) => {
        if (tagName === 'iframe') {
          params;
          return {
            'X-Frame-Options': 'ALLOW-FROM https://google.com'
          };
        }
      }
    };
    const rendered = renderer.create(
      <HTML
        WebView={WebView}
        renderers={{
          iframe: IframeRenderer
        }}
        contentWidth={10}
        {...props}
      />
    );
    expect(rendered.toJSON()).toMatchSnapshot();
  });
});
