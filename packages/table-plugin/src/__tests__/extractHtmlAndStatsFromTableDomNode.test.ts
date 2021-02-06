import { parseDOM } from 'htmlparser2';
import { toSerializableNode } from '@native-html/transient-render-engine';
import extractHtmlAndStatsFromTableDomNode from '../extractHtmlAndStatsFromTableDomNode';

const simpleHTML =
  '<table><tr><th>Entry Header 1</th><th>Entry Header 2</th><th>Entry Header 3</th></tr></table>';

describe('extractHtmlAndStatsFromTableDomNode', () => {
  //
  it('should preserve HTML', () => {
    const domRoot = toSerializableNode(parseDOM(simpleHTML)[0]);
    expect(domRoot).toMatchObject({
      type: 'element',
      tagName: 'table'
    });
    expect(extractHtmlAndStatsFromTableDomNode(domRoot)).toMatchObject({
      html: simpleHTML,
      stats: {
        numOfRows: 1,
        numOfColumns: 3,
        numOfChars: expect.any(Number)
      }
    });
  });
});
