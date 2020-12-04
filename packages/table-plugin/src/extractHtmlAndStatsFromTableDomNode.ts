import { domNodeToHTMLString, HTMLNode } from 'react-native-render-html';
import { HTMLTableStats } from './types';

export default function extractHtmlAndStatsFromTableDomNode(domNode: HTMLNode) {
  let stats: HTMLTableStats = {
    numOfChars: 0,
    numOfColumns: 0,
    numOfRows: 0
  };
  const innerHTML = domNodeToHTMLString(domNode, (node, _depth, html) => {
    if (node.type === 'tag') {
      if (node.name === 'tr') {
        stats.numOfRows += 1;
      } else if (
        (node.name === 'td' || node.name === 'th') &&
        stats.numOfRows === 0
      ) {
        stats.numOfColumns += 1;
      }
    } else if (node.type === 'text') {
      stats.numOfChars += html.length;
    }
  });
  return {
    html: innerHTML,
    stats
  };
}
