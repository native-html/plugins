import { CustomBlockRenderer } from '@native-html/render';
import { HeuristicTablePluginConfig } from './shared-types';
import TableRenderer from './TableRenderer';
import TdRenderer from './TdRenderer';
import ThRenderer from './ThRenderer';
import colgroupModel from './ColgroupModel';

export {
  CellProperties,
  Coordinates,
  DisplayCell,
  HeuristicTablePluginConfig,
  HTMLTableProps,
  Settings,
  TableCell,
  TableFlexColumnContainer,
  TableFlexRowContainer,
  TableCellPropsFromParent,
  TableRoot
} from './shared-types';

export {
  DEFAULT_FONT_WEIGHT_COEFFS,
  FontWeightCoefficients
} from './helpers/TCellConstraintsComputer';

export { TableRenderer, ThRenderer, TdRenderer, colgroupModel };

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

declare module '@native-html/render' {
  interface RenderersProps {
    /**
     * Configuration for `@native-html/heuristic-table-plugin` table renderer.
     */
    table?: HeuristicTablePluginConfig;
  }
}

export default renderers;
