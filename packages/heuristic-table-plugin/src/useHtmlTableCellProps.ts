import { TBlock, CustomRendererProps } from 'react-native-render-html';
import { TableCellPropsFromParent } from './shared-types';

/**
 * Customize `td` and `th` renderers while reusing default cell renderer logic.
 *
 * @param props - Props from custom renderer.
 *
 * @public
 */
export default function useHtmlTableCellProps({
  propsFromParent,
  ...props
}: CustomRendererProps<TBlock>): CustomRendererProps<TBlock> {
  const { config, cell } = propsFromParent as TableCellPropsFromParent;
  const styleFromConfig = config?.getStyleForCell?.call(null, cell);
  let spanStyles = {};
  if (cell.lenY > 1) {
    spanStyles = { justifyContent: 'center' };
  }
  if (cell.lenX > 1) {
    spanStyles = { alignItems: 'center' };
  }
  const style = {
    ...props.style,
    flexGrow: 1,
    flexShrink: 0,
    ...spanStyles,
    ...styleFromConfig,
    width: cell.width,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0
  };
  return {
    ...props,
    style,
    propsFromParent
  };
}
