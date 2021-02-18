import pick from 'ramda/src/pick';
import pipe from 'ramda/src/pipe';
import sum from 'ramda/src/sum';
import map from 'ramda/src/map';
import values from 'ramda/src/values';
import multiply from 'ramda/src/multiply';
import { TextStyle } from 'react-native';
import { TNode } from 'react-native-render-html';
import { TText } from '@native-html/transient-render-engine';

const fontWeightCoeffs: Record<Required<TextStyle>['fontWeight'], number> = {
  '100': 0.8,
  '200': 0.85,
  '300': 0.9,
  '400': 1,
  '500': 1.1,
  '600': 1.2,
  '700': 1.3,
  '800': 1.4,
  '900': 1.5,
  bold: 1.3,
  normal: 1
};

function toNumber(value: string | number | undefined) {
  if (typeof value === 'number') {
    return value;
  }
  return 0;
}

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

const hspacingFields: Array<SpacingFields> = [
  'borderLeftWidth',
  'borderRightWidth',
  'marginLeft',
  'marginRight',
  'paddingLeft',
  'paddingRight'
];

/**
 * 14ddp = 1wg
 */
const WEIGHT_U = 14;

const computeHzWeight = pipe<
  NativeBlockRetStyle,
  Pick<NativeBlockRetStyle, SpacingFields>,
  Array<string | number>,
  number[],
  number,
  number
>(
  pick<SpacingFields>(hspacingFields),
  values as any,
  map(toNumber),
  sum,
  multiply(1 / WEIGHT_U)
);

export default function computeTNodeWeight(tnode: TNode): number {
  const hspaceWeight = computeHzWeight(tnode.styles.nativeBlockRet);
  if (tnode instanceof TText) {
    const fontSize = tnode.styles.nativeTextFlow.fontSize ?? WEIGHT_U;
    const fontWeight = tnode.styles.nativeTextFlow.fontWeight ?? 'normal';
    const fontWeightCoeff = fontWeightCoeffs[fontWeight] ?? 1;
    return (
      (((tnode.data.length + 1) * fontSize) / WEIGHT_U) * fontWeightCoeff +
      hspaceWeight
    );
  }
  return (
    hspaceWeight +
    tnode.children.reduce((prev, curr) => computeTNodeWeight(curr) + prev, 0)
  );
}
