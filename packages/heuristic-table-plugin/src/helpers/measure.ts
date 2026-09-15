import { I18nManager, ViewStyle } from 'react-native';

type NativeBlockRetStyle = ViewStyle;
type SpacingFields = Extract<
  keyof NativeBlockRetStyle,
  | 'borderLeftWidth'
  | 'borderRightWidth'
  | 'marginLeft'
  | 'marginRight'
  | 'paddingLeft'
  | 'paddingRight'
>;

const hmarginFields: readonly SpacingFields[] = ['marginLeft', 'marginRight'];

function sumFields(
  style: NativeBlockRetStyle,
  fields: readonly SpacingFields[]
): number {
  return fields.reduce((acc, field) => {
    const val = style[field];
    return acc + (typeof val === 'number' ? val : 0);
  }, 0);
}

export function getHorizontalMargins(style: NativeBlockRetStyle): number {
  return sumFields(style, hmarginFields);
}

/**
 * The horizontal spacing that sits *inside* a border box.
 *
 * @remarks
 * React Native lays out with `box-sizing: border-box`, so an element's width
 * already contains its padding and border: only what is left of that width is
 * offered to its children. Margins are excluded here because they sit outside
 * the box, and so reduce the width the element itself may take rather than the
 * width it may pass on.
 */
export function getHorizontalInsets(style: NativeBlockRetStyle): number {
  const rtl =
    style.direction === 'rtl' ||
    (style.direction !== 'ltr' && I18nManager.isRTL);
  const start = style.paddingInlineStart ?? style.paddingStart;
  const end = style.paddingInlineEnd ?? style.paddingEnd;
  const horizontal =
    style.paddingInline ?? style.paddingHorizontal ?? style.padding;
  const left = (rtl ? end : start) ?? style.paddingLeft ?? horizontal;
  const right = (rtl ? start : end) ?? style.paddingRight ?? horizontal;
  const borderStart = style.borderStartWidth;
  const borderEnd = style.borderEndWidth;
  return [
    left,
    right,
    (rtl ? borderEnd : borderStart) ??
      style.borderLeftWidth ??
      style.borderWidth,
    (rtl ? borderStart : borderEnd) ??
      style.borderRightWidth ??
      style.borderWidth
  ].reduce<number>(
    (total, value) => total + (typeof value === 'number' ? value : 0),
    0
  );
}
