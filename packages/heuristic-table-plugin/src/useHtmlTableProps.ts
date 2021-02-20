import { useMemo } from 'react';
import {
  CustomTagRendererProps,
  TBlock,
  TNode
} from 'react-native-render-html';
import computeColumnWidths from './helpers/computeColumnWidths';
import createRenderTree from './helpers/createRenderTree';
import fillTableDisplay, {
  createEmptyDisplay
} from './helpers/fillTableDisplay';
import { HTMLTableProps } from './shared-types';

function useRenderTree({
  tnode,
  contentWidth
}: {
  tnode: TNode;
  contentWidth: number;
}) {
  return useMemo(() => {
    const display = createEmptyDisplay();
    fillTableDisplay(tnode, display);
    const columnWidths = computeColumnWidths(display, contentWidth);
    return createRenderTree(display, columnWidths);
  }, [tnode, contentWidth]);
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
  const contentWidth =
    typeof options.overrideContentWidth === 'number'
      ? options.overrideContentWidth
      : sharedProps.contentWidth;
  const tree = useRenderTree({ tnode, contentWidth });
  return {
    root: tree,
    config: table || {},
    contentWidth,
    sharedProps,
    tnode,
    ...props
  };
}
