import { TRenderEngine } from '@native-html/transient-render-engine';
import { TNode } from '@native-html/render';
import colgroupModel from '../ColgroupModel';

const engine = new TRenderEngine({
  // Unit fixtures isolate plugin defaults. Public-renderer tests retain the
  // RenderHTML defaults, including user-agent styles.
  stylesConfig: { enableUserAgentStyles: false },
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

/**
 * Every `td`/`th` of `tnode`, in document order.
 *
 * @remarks
 * A cell is not descended into, so a table nested inside one contributes none
 * of its own cells to the result.
 */
function collectCells(tnode: TNode, found: TNode[] = []): TNode[] {
  if (tnode.tagName === 'td' || tnode.tagName === 'th') {
    found.push(tnode);
  } else {
    for (const child of tnode.children) {
      collectCells(child, found);
    }
  }
  return found;
}

/**
 * Build a transient render tree from `html` and return one of the cells of its
 * outermost table.
 *
 * @param nth - Which cell to return, in document order. Defaults to the first.
 */
export function createCellTNode(html: string, nth = 0): TNode {
  const cell = collectCells(createTableTNode(html))[nth];
  expect(cell?.tagName).toMatch(/^t[dh]$/);
  return cell as TNode;
}
