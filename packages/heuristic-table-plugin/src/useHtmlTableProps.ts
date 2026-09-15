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
     * Lay the table out against this width instead of the document's.
     *
     * @remarks
     * Also detaches the table from the cell it sits in, if any: an explicit
     * width is taken as the whole story, so the content box of an enclosing
     * cell is not subtracted from it as well.
     */
    overrideContentWidth?: number;
  } = {}
): HTMLTableProps {
  const table = useRendererProps('table');
  // Destructured field by field, and memoized on the fields rather than on
  // `table`, deliberately. `RenderersPropsProvider` memoizes on the whole
  // `renderersProps` prop, so an inline `renderersProps={{ table: {...} }}` —
  // the form the README shows — yields a new `table` object on every render.
  // Depending on `table` itself would therefore rebuild `settings`, and with
  // it the entire `TableLayout`, on every render of every table.
  const forceStretch = table?.forceStretch;
  const baseFontCoeff = table?.baseFontCoeff;
  const fontWeightCoeffs = table?.fontWeightCoeffs;
  const borderCollapse = table?.borderCollapse;
  const getStyleForCell = table?.getStyleForCell;
  const sharedContentWidth = useContentWidth();
  const cellContentBox = useContext(CellContentWidthContext);
  const override =
    typeof options.overrideContentWidth === 'number'
      ? options.overrideContentWidth
      : undefined;
  const contentWidth = override ?? sharedContentWidth;
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
    cellContentBox: override === undefined ? cellContentBox : undefined
  });
  return {
    layout,
    config: table ?? EMPTY_CONFIG,
    sharedProps,
    tnode,
    ...props
  };
}
