import React from 'react';
import {
  CustomBlockRenderer,
  defaultHTMLElementModels
} from 'react-native-render-html';
import RenderCell from './RenderCell';

/**
 * The renderer component for `th` tag.
 *
 * @param props - Component props.
 * @public
 */
const RenderTh: CustomBlockRenderer = function (props) {
  return React.createElement(RenderCell, props);
};

RenderTh.model = defaultHTMLElementModels.th;

export default RenderTh;
