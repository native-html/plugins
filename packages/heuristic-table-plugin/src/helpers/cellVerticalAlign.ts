import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import { getInlineStyleValue } from './inlineStyle';

export type CellVerticalAlign = 'baseline' | 'bottom' | 'middle' | 'top';

function normalizeVerticalAlign(value: string): CellVerticalAlign | null {
  switch (value.toLowerCase()) {
    case 'top':
    case 'middle':
    case 'bottom':
    case 'baseline':
      return value.toLowerCase() as CellVerticalAlign;
    case 'initial':
    case 'unset':
      return 'baseline';
    case 'inherit':
    case 'revert':
    case 'revert-layer':
      return null;
    default:
      // Lengths, percentages and the inline-only vertical-align keywords are
      // treated as baseline for table cells by CSS.
      return 'baseline';
  }
}

/**
 * The alignment HTML's user-agent stylesheet gives a table cell.
 *
 * @remarks
 * Row groups and direct table rows are aligned to the middle, and rows and
 * cells inherit it. Being a user-agent declaration, it is outranked by any
 * author style that resolves to the same native property.
 *
 * @public
 */
export const DEFAULT_CELL_VERTICAL_ALIGN: CellVerticalAlign = 'middle';

/**
 * Resolve the vertical alignment a native table cell should emulate.
 *
 * The CSS processor intentionally drops `vertical-align` because React Native
 * cannot consume it directly, so table renderers recover the value from inline
 * CSS and the legacy `valign` attribute here.
 *
 * @returns The declared alignment, or `null` when the cell inherits nothing
 * but {@link DEFAULT_CELL_VERTICAL_ALIGN}. Callers need the distinction: the
 * default may not overwrite an author `justify-content`, whereas a declared
 * alignment must.
 */
export function resolveCellVerticalAlign(
  tnode: TNode
): CellVerticalAlign | null {
  for (
    let current: TNode | null = tnode;
    current && current.tagName !== 'table';
    current = current.parent
  ) {
    const inlineValue = getInlineStyleValue(current, 'vertical-align');
    if (inlineValue) {
      const normalized = normalizeVerticalAlign(inlineValue);
      if (normalized) {
        return normalized;
      }
    }
    const attributeValue = current.attributes.valign;
    if (attributeValue) {
      const normalized = normalizeVerticalAlign(attributeValue);
      if (normalized) {
        return normalized;
      }
    }
  }
  return null;
}

/**
 * How a table cell emulates `vertical-align` in a column flex container.
 *
 * @remarks
 * `baseline` has no native equivalent for a block box, and a cell's first line
 * box sits at its top, so it collapses onto the same alignment as `top`.
 */
export const justifyContentForVerticalAlign: Record<
  CellVerticalAlign,
  NonNullable<ViewStyle['justifyContent']>
> = {
  baseline: 'flex-start',
  bottom: 'flex-end',
  middle: 'center',
  top: 'flex-start'
};
