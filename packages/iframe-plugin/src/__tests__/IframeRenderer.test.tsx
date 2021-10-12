import React from 'react';
import HTML, { RenderHTMLProps } from 'react-native-render-html';
import renderer from 'react-test-renderer';
import WebView from '@formidable-webview/ersatz';
import IframeRenderer, { iframeModel } from '../IframeRenderer';

describe('iframe renderer', () => {
  const defaultConfig: Partial<RenderHTMLProps> = {
    WebView,
    renderers: {
      iframe: IframeRenderer
    },
    customHTMLElementModels: {
      iframe: iframeModel
    },
    contentWidth: 10
  };
  it('should render without errors', () => {
    expect(() => {
      renderer.create(
        <HTML
          {...defaultConfig}
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
        //@ts-ignore
        if (tagName === 'iframe') {
          params;
          return {
            'X-Frame-Options': 'ALLOW-FROM https://google.com'
          };
        }
      }
    };
    const rendered = renderer.create(<HTML {...defaultConfig} {...props} />);

    expect(rendered.root.findByType(WebView).props.source).toMatchObject({
      headers: {
        'X-Frame-Options': 'ALLOW-FROM https://google.com'
      }
    });
  });
});
