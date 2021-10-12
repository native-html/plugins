import { IframeConfig } from './HTMLIframe';
export { default, iframeModel } from './IframeRenderer';
export { default as useHtmlIframeProps } from './useHtmlIframeProps';
export { default as HTMLIframe } from './HTMLIframe';
export type { HTMLIframeProps, IframeConfig } from './HTMLIframe';

declare module 'react-native-render-html' {
  interface RenderersProps {
    /**
     * Configuration for `@native-html/iframe-plugin` iframe renderer.
     */
    iframe?: IframeConfig;
  }

  interface EmbeddedWithHeadersParamsMap {
    iframe: {
      /**
       * The print height of the iframe in DPI.
       */
      printHeight: number;
      /**
       * The print width of the iframe in DPI.
       */
      printWidth: number;
    };
  }
}
