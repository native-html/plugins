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

function collectTables(tnode: TNode, found: TNode[] = []): TNode[] {
  if (tnode.tagName === 'table') {
    found.push(tnode);
  }
  for (const child of tnode.children) {
    collectTables(child, found);
  }
  return found;
}

/**
 * Build a transient render tree from `html` and return one of its `table`
 * nodes, however deeply nested. The tnode keeps its ancestors, so helpers
 * which walk up the tree see the real containing blocks.
 *
 * @param nth - Which table to return, in document order. Defaults to the
 * outermost one; pass `1` for the table nested inside it.
 */
export function createTableTNode(html: string, nth = 0) {
  const table = collectTables(engine.buildTTree(html) as unknown as TNode)[nth];
  expect(table?.tagName).toBe('table');
  return table as TNode;
}
