import { CustomBlockRenderer } from 'react-native-render-html';
import RenderTable from './RenderTable';
import RenderTd from './RenderTd';
import RenderTh from './RenderTh';

export {
  TableCell,
  DisplayCell,
  CellProperties,
  Coordinates,
  HeuristicTablePluginConfig
} from './shared-types';

/**
 * Renderers to be merged in the `renderers` prop of `RenderHTML` component.
 *
 * @public
 */
const renderers: Record<'th' | 'td' | 'table', CustomBlockRenderer> = {
  table: RenderTable,
  th: RenderTh,
  td: RenderTd
};

export default renderers;
