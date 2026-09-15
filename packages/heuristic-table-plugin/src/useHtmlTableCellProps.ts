import { ViewStyle } from 'react-native';
import {
  TBlock,
  CustomRendererProps,
  PropsFromParent
} from '@native-html/render';
import { InternalTableCellPropsFromParent } from './shared-types';
import relaxHeightConstraint from './helpers/relaxHeightConstraint';
import composeCellStyle from './helpers/composeCellStyle';
import {
  CellVerticalAlign,
  getCollapsedCellBorderStyle,
  resolveConfiguredCellStyle,
  resolveCellVerticalAlign,
  getSourceBlockStyle
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
 * Whether a cell renderer was reached through this plugin's own table.
 *
 * @remarks
 * `PropsFromParent` extends `Record<string, any>`, so the props a `td` or `th`
 * renderer receives type-check whatever produced them. A cell rendered outside
 * a {@link TableRenderer} — a stray `td` in a fragment, or a document that
 * registered this plugin's `td` renderer without its `table` renderer — gets
 * none of the layout below, and every field this hook reads is absent.
 */
function isTableCellPropsFromParent(
  propsFromParent: PropsFromParent | undefined
): propsFromParent is InternalTableCellPropsFromParent {
  return typeof (propsFromParent as Partial<InternalTableCellPropsFromParent>)
    ?.cell?.lenX === 'number';
}

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
  if (!isTableCellPropsFromParent(propsFromParent)) {
    // Nothing laid this cell out, so there is no width, no matrix position and
    // no resolved style to apply. Render it as the plain block it is rather
    // than reaching into a layout that was never built.
    return { ...props, propsFromParent };
  }
  const {
    borderCollapse,
    config,
    cell,
    maxX,
    maxY,
    tableBorderStyle,
    resolvedCellStyle
  } = propsFromParent;
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
          composeCellStyle(getSourceBlockStyle(props.tnode), styleFromConfig),
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
        paddingSource: getSourceBlockStyle(props.tnode)
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
