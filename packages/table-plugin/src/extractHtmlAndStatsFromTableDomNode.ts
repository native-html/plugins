import { domNodeToHTMLString } from 'react-native-render-html';
import { isDomElement, isDomText } from '@native-html/transient-render-engine';
import { HTMLTableStats } from './types';
import type { Node } from 'domhandler';

export default function extractHtmlAndStatsFromTableDomNode(
  domNode: Node | null
) {
  let stats: HTMLTableStats = {
    numOfChars: 0,
    numOfColumns: 0,
    numOfRows: 0
  };
  const innerHTML = domNodeToHTMLString(domNode, (node, _depth, html) => {
    if (isDomElement(node)) {
      if (node.tagName === 'tr') {
        stats.numOfRows += 1;
      } else if (
        (node.tagName === 'td' || node.tagName === 'th') &&
        stats.numOfRows === 0
      ) {
        stats.numOfColumns += 1;
      }
    } else if (isDomText(node)) {
      stats.numOfChars += html.length;
    }
  });
  return {
    html: innerHTML,
    stats
  };
}
