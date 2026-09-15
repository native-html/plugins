import { createContext } from 'react';
import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import { BorderSpacing } from './helpers/resolveBorderSpacing';
import { ResolvedCellStyle } from './helpers/resolveTableStyles';
import { HeuristicTablePluginConfig } from './shared-types';

/**
 * Everything the render tree needs which is the same for every node in one
 * table.
 *
 * @remarks
 * Carried in context rather than threaded through {@link TreeRenderer}: the
 * tree recurses through row and column containers to reach a cell, and every
 * level in between would otherwise have to accept and forward values it makes
 * no use of.
 */
export interface TableRenderContextValue {
  borderSpacing: BorderSpacing;
  cellStyles: ReadonlyMap<TNode, ResolvedCellStyle>;
  borderCollapse: boolean;
  /**
   * The wrapper edge the collapsing model resolved.
   *
   * @remarks
   * Cells need this, not just their position in the matrix: an outer boundary
   * the wrapper leaves bare is still theirs to paint.
   */
  tableBorderStyle: ViewStyle | null;
  maxX: number;
  maxY: number;
  config?: HeuristicTablePluginConfig;
}

const DEFAULT_CONTEXT: TableRenderContextValue = {
  borderSpacing: { horizontal: 0, vertical: 0 },
  cellStyles: new Map(),
  borderCollapse: false,
  tableBorderStyle: null,
  maxX: -1,
  maxY: -1
};

export default createContext<TableRenderContextValue>(DEFAULT_CONTEXT);
