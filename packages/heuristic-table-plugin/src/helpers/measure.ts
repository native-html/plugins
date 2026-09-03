import { TNode } from '@native-html/render';

type NativeBlockRetStyle = TNode['styles']['nativeBlockRet'];
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

const hinsetFields: readonly SpacingFields[] = [
  'borderLeftWidth',
  'borderRightWidth',
  'paddingLeft',
  'paddingRight'
];

const hspacingFields: readonly SpacingFields[] = [
  'borderLeftWidth',
  'borderRightWidth',
  'paddingLeft',
  'paddingRight',
  'marginLeft',
  'marginRight'
];

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
  return sumFields(style, hinsetFields);
}

export function getHorizontalSpacing(style: NativeBlockRetStyle): number {
  return sumFields(style, hspacingFields);
}
