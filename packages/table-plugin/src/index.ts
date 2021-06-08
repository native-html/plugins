import type { TableConfig } from './types';
export type {
  HTMLTableBaseProps,
  HTMLTableProps,
  HTMLTableStats,
  TableStyleSpecs,
  TableConfig,
  TableContentHeightState,
  TableAccurateContentHeightState,
  TableHeuristicContentHeightState
} from './types';
export { defaultTableStylesSpecs, cssRulesFromSpecs } from './css-rules';
export { HTMLTable } from './HTMLTable';
export { default as useHtmlTableProps } from './useHtmlTableProps';
export { default, tableModel } from './TableRenderer';

declare module 'react-native-render-html' {
  interface RenderersProps {
    /**
     * Configuration for `@native-html/table-plugin` table renderer.
     */
    table?: TableConfig;
  }
}
