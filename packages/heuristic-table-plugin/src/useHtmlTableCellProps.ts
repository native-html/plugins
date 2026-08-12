import { TBlock, CustomRendererProps } from '@native-html/render';
import { TableCellPropsFromParent } from './shared-types';
import relaxHeightConstraint from './helpers/relaxHeightConstraint';

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
  // Vertical and horizontal centering are independent, so a cell that both
  // spans rows and spans columns must keep the two: assigning here rather than
  // merging would drop the vertical centering of every `rowspan`+`colspan`
  // cell.
  const spanStyles = {
    ...(cell.lenY > 1 ? { justifyContent: 'center' as const } : null),
    ...(cell.lenX > 1 ? { alignItems: 'center' as const } : null)
  };
  const style = {
    // An explicit height on a cell is a minimum height in HTML, so that the
    // cell still grows to fit its content.
    ...relaxHeightConstraint(props.style),
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
