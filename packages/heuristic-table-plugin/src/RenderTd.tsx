import React from 'react';
import {
  CustomBlockRenderer,
  defaultHTMLElementModels
} from 'react-native-render-html';
import RenderCell from './RenderCell';

/**
 * The renderer component for `td` tag.
 *
 * @param props - Component props.
 * @public
 */
const RenderTd: CustomBlockRenderer = function (props) {
  return React.createElement(RenderCell, props);
};

RenderTd.model = defaultHTMLElementModels.td;

export default RenderTd;
