import { TNode } from '@native-html/render';
import { getHorizontalInsets, getHorizontalMargins } from './measure';
import { clampWidth, resolveWidthConstraints } from './resolveWidth';
import { getPaintedBlockStyle } from './tableStyles';
import type { CellContentBox } from '../CellContentWidthContext';

/**
 * The width `tnode` offers to a block-level child, i.e. its content box.
 */
function reduceToContentBox(tnode: TNode, containingWidth: number): number {
  // The insets have to be the ones the ancestor is painted with rather than
  // the ones it declares: a bare cell would otherwise hand its children the
  // user-agent padding it is about to spend, and a table nested in it would
  // overflow by that much once per level of nesting.
  const style = getPaintedBlockStyle(tnode);
  const { width, minWidth, maxWidth } = resolveWidthConstraints(
    tnode,
    containingWidth
  );
  // A declared width is a border box in React Native, so it already accounts
  // for padding and border; an auto width fills the containing block, minus
  // the margins that sit outside the box. Either way `min-width` and
  // `max-width` only bound the result: an ancestor asking for *at least*
  // 100px still hands its children everything it was given, and must not
  // squeeze them into that 100px.
  const borderBox = clampWidth(
    width ?? containingWidth - getHorizontalMargins(style),
    minWidth,
    maxWidth
  );
  return Math.max(0, borderBox - getHorizontalInsets(style));
}

/**
 * Resolve the width the containing block of `tnode` actually offers.
 *
 * @remarks
 * `contentWidth` is published once, at the root of the render tree, and is
 * never narrowed as the engine descends. A node nested in padded, bordered or
 * explicitly sized ancestors therefore has to subtract their horizontal
 * spacing itself — otherwise it lays out against a width it was never given
 * and overflows every one of them.
 *
 * @param tnode - The node whose containing block should be measured.
 * @param contentWidth - The width available at the root of the render tree.
 */
export default function resolveAvailableWidth(
  tnode: TNode,
  contentWidth: number,
  cellContentBox?: CellContentBox
): number {
  const ancestors: TNode[] = [];
  for (let parent = tnode.parent; parent; parent = parent.parent) {
    if (parent === cellContentBox?.tnode) {
      // Start inside the assigned cell, then account only for wrappers
      // between that cell and this table. Its insets are already deducted.
      return ancestors.reduce(
        (width, ancestor) => reduceToContentBox(ancestor, width),
        cellContentBox.contentWidth
      );
    }
    ancestors.unshift(parent);
  }
  return ancestors.reduce(
    (width, ancestor) => reduceToContentBox(ancestor, width),
    contentWidth
  );
}
