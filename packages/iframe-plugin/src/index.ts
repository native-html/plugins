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
}
