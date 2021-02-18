import { TRenderEngine } from '@native-html/transient-render-engine';
const engine = new TRenderEngine();

export function createTableTNode(html: string) {
  const ttree = engine.buildTTree(html);
  const table = ttree.children[0].children[0];
  expect(table.tagName).toBe('table');
  return table;
}
