import { TNode } from '@native-html/render';

export function getInlineStyleValue(
  tnode: TNode,
  propertyName: string
): string | null {
  const inlineStyle = tnode.attributes.style;
  if (!inlineStyle) {
    return null;
  }
  let value: string | null = null;
  for (const declaration of inlineStyle.split(';')) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }
    const name = declaration.slice(0, colonIndex).trim().toLowerCase();
    if (name === propertyName) {
      value = declaration
        .slice(colonIndex + 1)
        .replace(/\s*!important\s*$/i, '')
        .trim()
        .toLowerCase();
    }
  }
  return value;
}
