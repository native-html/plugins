import React from 'react';
import { CustomBlockRenderer } from 'react-native-render-html';
import { HeuristicTablePluginConfig, TableCell } from './shared-types';

interface CellPropsFromParent {
  config?: HeuristicTablePluginConfig;
  cell: TableCell;
}

const RenderCell: CustomBlockRenderer = function ({
  TDefaultRenderer,
  propsFromParent,
  ...props
}) {
  // const markCells = { margin: 5, backgroundColor: 'red' }
  const markCells = {};
  const { config, cell } = (propsFromParent as unknown) as CellPropsFromParent;
  const styleFromConfig = config?.getStyleForCell?.call(null, cell);
  let spanStyles = {};
  if (cell.lenY > 1) {
    spanStyles = { justifyContent: 'center' };
  }
  if (cell.lenX > 1) {
    spanStyles = { alignItems: 'center' };
  }
  const style = [
    props.style,
    {
      flexGrow: 1,
      flexShrink: 0,
      ...markCells,
      ...spanStyles
    },
    styleFromConfig
  ];
  return (
    <TDefaultRenderer
      {...props}
      propsFromParent={propsFromParent}
      style={style}
    />
  );
};

export default RenderCell;
