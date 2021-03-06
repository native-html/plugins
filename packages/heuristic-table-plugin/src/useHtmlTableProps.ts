import { useMemo } from 'react';
import {
  CustomTagRendererProps,
  TBlock,
  TNode
} from 'react-native-render-html';
import { Settings, HTMLTableProps } from './shared-types';
import TableLayout from './TableLayout';

function useTableLayout({
  tnode,
  settings
}: {
  tnode: TNode;
  settings: Settings;
}) {
  return useMemo(() => {
    return new TableLayout(tnode, settings);
  }, [tnode, settings]);
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
  { sharedProps, tnode, ...props }: CustomTagRendererProps<TBlock>,
  options: {
    /**
     * If present, overrides contentWidth from shared props.
     */
    overrideContentWidth?: number;
  } = {}
): HTMLTableProps {
  const {
    renderersProps: { table }
  } = sharedProps;
  const forceStretch = table?.forceStretch ?? false;
  const contentWidth =
    typeof options.overrideContentWidth === 'number'
      ? options.overrideContentWidth
      : sharedProps.contentWidth;
  const settings = useMemo(() => ({ contentWidth, forceStretch }), [
    contentWidth,
    forceStretch
  ]);
  const layout = useTableLayout({ tnode, settings });
  return {
    layout,
    settings,
    config: table || {},
    sharedProps,
    tnode,
    ...props
  };
}
