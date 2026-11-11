/**
 * Read a property from a `style` attribute, without `!important`, trimmed and
 * lowercased. The last declaration wins.
 *
 * @remarks
 * Splits on every `;`, so a quoted or `url()` value holding one is cut short.
 *
 * @param inlineStyle - The raw `style` attribute, if any.
 * @param propertyName - The property to look up, in lowercase.
 * @returns The normalized value, or `null` when the property is not declared.
 */
export function getPropertyValue(
  inlineStyle: string | undefined,
  propertyName: string
): string | null {
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
      // Priority is moot: callers only weigh this against HTML attributes.
      value = declaration
        .slice(colonIndex + 1)
        .replace(/\s*!important\s*$/i, '')
        .trim()
        .toLowerCase();
    }
  }
  return value;
}
