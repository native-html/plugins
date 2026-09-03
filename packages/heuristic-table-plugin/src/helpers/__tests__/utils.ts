import { TRenderEngine } from '@native-html/transient-render-engine';
import { TNode } from '@native-html/render';
import colgroupModel from '../../ColgroupModel';

const engine = new TRenderEngine({
  customizeHTMLModels(defaultModels) {
    return {
      ...defaultModels,
      colgroup: colgroupModel
    };
  }
});

function findTable(tnode: TNode): TNode | null {
  if (tnode.tagName === 'table') {
    return tnode;
  }
  for (const child of tnode.children) {
    const table = findTable(child);
    if (table) {
      return table;
    }
  }
  return null;
}

/**
 * Build a transient render tree from `html` and return its first `table`,
 * however deeply it is nested. The tnode keeps its ancestors, so helpers which
 * walk up the tree see the real containing blocks.
 */
export function createTableTNode(html: string) {
  const table = findTable(engine.buildTTree(html) as unknown as TNode);
  expect(table?.tagName).toBe('table');
  return table as TNode;
}
