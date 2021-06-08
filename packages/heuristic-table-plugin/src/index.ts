import { CustomBlockRenderer } from 'react-native-render-html';
import { HeuristicTablePluginConfig, Settings } from './shared-types';
import TableRenderer from './TableRenderer';
import TdRenderer from './TdRenderer';
import ThRenderer from './ThRenderer';

export {
  CellProperties,
  Coordinates,
  DisplayCell,
  HeuristicTablePluginConfig,
  HTMLTableProps,
  TableCell,
  TableFlexColumnContainer,
  TableFlexRowContainer,
  TableCellPropsFromParent,
  TableRoot
} from './shared-types';

export { TableRenderer, ThRenderer, TdRenderer };

/**
 * Renderers to be merged in the `renderers` prop of `RenderHTML` component.
 *
 * @public
 */
const renderers: Record<'th' | 'td' | 'table', CustomBlockRenderer> = {
  table: TableRenderer,
  th: ThRenderer as any,
  td: TdRenderer as any
};

export { default as useHtmlTableProps } from './useHtmlTableProps';
export { default as useHtmlTableCellProps } from './useHtmlTableCellProps';
export { default as HTMLTable } from './HTMLTable';

declare module 'react-native-render-html' {
  interface RenderersProps {
    /**
     * Configuration for `@native-html/heuristic-table-plugin` table renderer.
     */
    table?: Settings & HeuristicTablePluginConfig;
  }
}

export default renderers;
