import { TNode } from '@native-html/render';
import { getInlineStyleValue } from './tableStyles';
import { resolveAttributeLength } from './resolveWidth';

export interface BorderSpacing {
  horizontal: number;
  vertical: number;
}

const ZERO: BorderSpacing = { horizontal: 0, vertical: 0 };

const LENGTH_REGEX = /^(\d*\.?\d+)(px|em|rem|pt|pc|in|cm|mm)?$/;

/** CSS absolute units, in px. */
const ABSOLUTE_SCALES: Record<string, number> = {
  px: 1,
  pt: 96 / 72,
  pc: 16,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4
};

const DEFAULT_FONT_SIZE = 16;

function rootOf(node: TNode): TNode {
  let root = node;
  while (root.parent) root = root.parent;
  return root;
}

function parseSpacing(value: string, node: TNode): BorderSpacing | null {
  const parts = value.split(/\s+/);
  if (parts.length < 1 || parts.length > 2) return null;
  // The font-relative units resolve against this node, so the scales are the
  // same for both parts and are built once rather than per part.
  const scales: Record<string, number> = {
    ...ABSOLUTE_SCALES,
    em: node.styles.nativeTextFlow.fontSize ?? DEFAULT_FONT_SIZE,
    rem: rootOf(node).styles.nativeTextFlow.fontSize ?? DEFAULT_FONT_SIZE
  };
  const lengths = parts.map((part) => {
    const match = LENGTH_REGEX.exec(part);
    if (!match) return NaN;
    const number = Number(match[1]);
    const unit = match[2];
    // Only zero may go unitless; every other bare number is invalid CSS.
    if (!unit) return number === 0 ? 0 : NaN;
    return number * scales[unit]!;
  });
  if (lengths.some((length) => !Number.isFinite(length))) return null;
  return { horizontal: lengths[0]!, vertical: lengths[1] ?? lengths[0]! };
}

/** Unsupported web-only CSS survives on the source attributes, not native styles. */
export default function resolveBorderSpacing(
  tnode: TNode,
  collapse: boolean
): BorderSpacing {
  if (collapse) return ZERO;
  for (let node: TNode | null = tnode; node; node = node.parent) {
    const value = getInlineStyleValue(node, 'border-spacing');
    if (value === 'initial') return ZERO;
    if (value) {
      const spacing = parseSpacing(value, node);
      if (spacing) return spacing;
      if (value === 'inherit' || value === 'unset') continue;
    }
    if (node.tagName === 'table') {
      const spacing = resolveAttributeLength(node.attributes.cellspacing);
      if (spacing !== null) return { horizontal: spacing, vertical: spacing };
    }
  }
  return ZERO;
}
