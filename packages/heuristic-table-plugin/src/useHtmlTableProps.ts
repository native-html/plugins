import { useContext, useMemo } from 'react';
import CellContentWidthContext, {
  CellContentBox
} from './CellContentWidthContext';
import {
  CustomRendererProps,
  TBlock,
  TNode,
  useContentWidth,
  useRendererProps
} from '@native-html/render';
import { HeuristicTablePluginConfig, Settings, HTMLTableProps } from './shared-types';
import TableLayout from './TableLayout';

/**
 * Stands in for an absent `renderersProps.table`.
 *
 * @remarks
 * Shared rather than built per render, so that a document configuring no
 * table options still hands `HTMLTable` a stable `config` and lets its
 * `memo` hold.
 */
const EMPTY_CONFIG: HeuristicTablePluginConfig = {};

function useTableLayout({
  tnode,
  settings,
  cellContentBox
}: {
  tnode: TNode;
  settings: Settings;
  cellContentBox?: CellContentBox;
}) {
  return useMemo(() => {
    return new TableLayout(tnode, settings, cellContentBox);
  }, [tnode, settings, cellContentBox]);
}

/**
 * Customize the rendering logic of the table renderer via this hook.
 *
 * @param props - Props from custom renderer props.
 * @param options - Customize this hook behavior.
 *
 * @returns props for the {@link HTMLTable} component.
 *
 * @public
 */
export default function useHtmlTableProps(
  { sharedProps, tnode, ...props }: CustomRendererProps<TBlock>,
  options: {
    /**
     * If present, overrides contentWidth from shared props.
     */
    overrideContentWidth?: number;
  } = {}
): HTMLTableProps {
  const table = useRendererProps('table');
  const forceStretch = table?.forceStretch;
  const baseFontCoeff = table?.baseFontCoeff;
  const fontWeightCoeffs = table?.fontWeightCoeffs;
  const borderCollapse = table?.borderCollapse;
  const getStyleForCell = table?.getStyleForCell;
  const sharedContentWidth = useContentWidth();
  const cellContentBox = useContext(CellContentWidthContext);
  const contentWidth =
    typeof options.overrideContentWidth === 'number'
      ? options.overrideContentWidth
      : sharedContentWidth;
  const settings = useMemo(
    () => ({
      contentWidth,
      forceStretch,
      baseFontCoeff,
      fontWeightCoeffs,
      borderCollapse,
      getStyleForCell
    }),
    [
      contentWidth,
      forceStretch,
      baseFontCoeff,
      fontWeightCoeffs,
      borderCollapse,
      getStyleForCell
    ]
  );
  const layout = useTableLayout({
    tnode,
    settings,
    cellContentBox:
      typeof options.overrideContentWidth === 'number'
        ? undefined
        : cellContentBox
  });
  return {
    layout,
    settings,
    config: table ?? EMPTY_CONFIG,
    sharedProps,
    tnode,
    ...props
  };
}
