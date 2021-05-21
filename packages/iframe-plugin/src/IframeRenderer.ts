import React from 'react';
import {
  CustomBlockRenderer,
  defaultHTMLElementModels,
  HTMLContentModel
} from 'react-native-render-html';
import { HTMLElementModel } from '@native-html/transient-render-engine';
import useHtmlIframeProps from './useHtmlIframeProps';
import HTMLIframe from './HTMLIframe';

/**
 * The renderer component for the iframe element. This renderer is fully
 * scalable, and will adjust to `contentWidth` and `computeEmbeddedMaxWidth`.
 * It also features `onLinkPress`.
 *
 * @public
 */
const IframeRenderer: CustomBlockRenderer = function IframeRenderer(props) {
  const iframeProps = useHtmlIframeProps(props);
  return iframeProps ? React.createElement(HTMLIframe, iframeProps) : null;
};

/**
 * The model to attach to custom iframe renderers.
 *
 * @public
 */
export const iframeModel: HTMLElementModel<
  'iframe',
  HTMLContentModel.block
> = defaultHTMLElementModels.iframe.extend({
  contentModel: HTMLContentModel.block,
  isOpaque: true
});

export default IframeRenderer;
