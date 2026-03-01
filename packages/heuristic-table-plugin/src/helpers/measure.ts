import { TNode } from 'react-native-render-html';

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

export function getHorizontalSpacing(style: NativeBlockRetStyle): number {
  return sumFields(style, hspacingFields);
}
