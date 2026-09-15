import { ViewStyle } from 'react-native';
import { TBlock, CustomRendererProps } from '@native-html/render';
import { InternalTableCellPropsFromParent } from './shared-types';
import relaxHeightConstraint from './helpers/relaxHeightConstraint';
import composeCellStyle from './helpers/composeCellStyle';
import {
  CellVerticalAlign,
  getCollapsedCellBorderStyle,
  resolveConfiguredCellStyle,
  resolveCellVerticalAlign
} from './helpers/tableStyles';

/**
 * How a table cell emulates `vertical-align` in a column flex container.
 *
 * @remarks
 * `baseline` has no native equivalent for a block box, and a cell's first line
 * box sits at its top, so it collapses onto the same alignment as `top`.
 */
const justifyContentForVerticalAlign: Record<
  CellVerticalAlign,
  NonNullable<ViewStyle['justifyContent']>
> = {
  baseline: 'flex-start',
  bottom: 'flex-end',
  middle: 'center',
  top: 'flex-start'
};

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
  const {
    borderCollapse,
    config,
    cell,
    maxX,
    maxY,
    tableBorderStyle,
    resolvedCellStyle
  } = propsFromParent as InternalTableCellPropsFromParent;
  const styleFromConfig = resolvedCellStyle
    ? resolvedCellStyle.configStyle
    : resolveConfiguredCellStyle(config?.getStyleForCell?.call(null, cell));
  const verticalAlign = resolveCellVerticalAlign(props.tnode);
  // Vertical table-cell alignment and horizontal colspan centering are
  // independent, so keep both declarations in the same style contribution.
  //
  // A declared `vertical-align` is the author declaration that targets cell
  // alignment, so it wins. Absent one, the middle default is only the
  // user-agent stylesheet's, and may not overwrite a `justify-content` the
  // cell already resolved from `tagsStyles` or its own CSS.
  const alignmentStyles = {
    justifyContent: verticalAlign
      ? justifyContentForVerticalAlign[verticalAlign]
      : (props.style?.justifyContent ?? 'center'),
    ...(cell.lenX > 1 ? { alignItems: 'center' as const } : null)
  };
  // The collapsing model has to weigh every border the cell actually paints,
  // config included: resolving it against the source CSS alone would strip a
  // border that came from `getStyleForCell` and leave nothing to draw it.
  const collapsedBorderStyle = resolvedCellStyle
    ? resolvedCellStyle.borderStyle
    : borderCollapse
      ? getCollapsedCellBorderStyle(
          cell,
          composeCellStyle(props.tnode.styles.nativeBlockRet, styleFromConfig),
          { maxX, maxY, tableBorderStyle }
        )
      : null;
  const style = {
    // Cells must fit their content even inside a fixed-height table viewport.
    ...composeCellStyle(
      relaxHeightConstraint(props.style),
      styleFromConfig ? relaxHeightConstraint(styleFromConfig) : null,
      {
        border: collapsedBorderStyle,
        rendererDefaults: { flexGrow: 1, flexShrink: 0, ...alignmentStyles },
        paddingSource: props.tnode.styles.nativeBlockRet
      }
    ),
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
