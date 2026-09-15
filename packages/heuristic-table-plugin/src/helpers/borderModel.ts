import { TNode } from '@native-html/render';
import { getInlineStyleValue } from './inlineStyle';

export type BorderCollapse = 'collapse' | 'separate';

/**
 * Resolve whether a table uses the collapsing border model.
 *
 * Inline `border-collapse` is not part of React Native styles, so it must be
 * read from the source DOM. The `rules` attribute also implies collapsed
 * borders in the HTML rendering rules.
 */
export function resolveBorderCollapse(
  tnode: TNode,
  configuredValue?: BorderCollapse
): boolean {
  if (configuredValue) {
    return configuredValue === 'collapse';
  }
  const ownValue = getInlineStyleValue(tnode, 'border-collapse');
  if (ownValue === 'collapse' || ownValue === 'separate') {
    return ownValue === 'collapse';
  }
  if (tnode.attributes.rules) {
    return true;
  }
  // border-collapse is inherited. Only inline declarations are available to
  // the plugin after unsupported web-only properties have been processed.
  for (let parent = tnode.parent; parent; parent = parent.parent) {
    const inheritedValue = getInlineStyleValue(parent, 'border-collapse');
    if (inheritedValue === 'collapse' || inheritedValue === 'separate') {
      return inheritedValue === 'collapse';
    }
  }
  return false;
}
