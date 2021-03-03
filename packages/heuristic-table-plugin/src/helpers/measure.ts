import pick from 'ramda/src/pick';
import pipe from 'ramda/src/pipe';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import values from 'ramda/src/values';
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

const hmarginFields = ['marginLeft', 'marginRight'] as const;

const hspacingFields: Array<SpacingFields> = [
  'borderLeftWidth',
  'borderRightWidth',
  'paddingLeft',
  'paddingRight',
  ...hmarginFields
];

function toNumber(value: string | number | undefined) {
  if (typeof value === 'number') {
    return value;
  }
  return 0;
}

export const getHorizontalMargins = pipe<
  NativeBlockRetStyle,
  Pick<NativeBlockRetStyle, SpacingFields>,
  Array<string | number>,
  number[],
  number
>(pick<SpacingFields>(hmarginFields), values as any, map(toNumber), sum);

export const getHorizontalSpacing = pipe<
  NativeBlockRetStyle,
  Pick<NativeBlockRetStyle, SpacingFields>,
  Array<string | number>,
  number[],
  number
>(pick<SpacingFields>(hspacingFields), values as any, map(toNumber), sum);
