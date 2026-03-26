import React, { act } from 'react';
import HTML, { RenderHTMLProps } from '@native-html/render';
import renderer from 'react-test-renderer';
import Ersatz from '@formidable-webview/ersatz';
import IframeRenderer, { iframeModel } from '../IframeRenderer';

describe('iframe renderer', () => {
  let rendered: renderer.ReactTestRenderer | null = null;

  afterEach(async () => {
    if (rendered) {
      await act(async () => {
        rendered!.unmount();
      });
      rendered = null;
    }
  });

  const defaultConfig: Partial<RenderHTMLProps> = {
    WebView: Ersatz,
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
      rendered = renderer.create(
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
        if (tagName === 'iframe') {
          return {
            'X-Frame-Options': 'ALLOW-FROM https://google.com'
          };
        }
      }
    };
    await act(async () => {
      rendered = renderer.create(<HTML {...defaultConfig} {...props} />);
    });

    expect(rendered!.root.findByType(Ersatz).props.source).toMatchObject({
      headers: {
        'X-Frame-Options': 'ALLOW-FROM https://google.com'
      }
    });
  });
});
