import React, { act } from 'react';
import HTML, { RenderHTMLProps } from 'react-native-render-html';
import renderer from 'react-test-renderer';
import WebView from 'react-native-webview';
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
  it('should render without errors', async () => {
    await act(async () => {
      renderer.create(
        <HTML
          {...defaultConfig}
          source={{
            html: '<iframe width="300" height="300" src="https://google.com/" />'
          }}
        />
      );
    });
  });
  it('should support provideEmbeddedHeaders prop', async () => {
    const props: RenderHTMLProps = {
      source: {
        html: '<iframe width="300" height="300" src="https://google.com/" />'
      },
      provideEmbeddedHeaders: (uri, tagName) => {
        // @ts-expect-error tagName can be 'iframe' at runtime
        if (tagName === 'iframe') {
          return {
            'X-Frame-Options': 'ALLOW-FROM https://google.com'
          };
        }
      }
    };
    let rendered: renderer.ReactTestRenderer;
    await act(async () => {
      rendered = renderer.create(<HTML {...defaultConfig} {...props} />);
    });

    expect(rendered!.root.findByType(WebView).props.source).toMatchObject({
      headers: {
        'X-Frame-Options': 'ALLOW-FROM https://google.com'
      }
    });
  });
});
