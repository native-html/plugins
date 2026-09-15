import { ViewStyle } from 'react-native';
import { TNode } from '@native-html/render';
import { BoxSide, BOX_SIDES, logicalSideOf } from './boxSides';

/**
 * The padding HTML's user-agent stylesheet gives a table cell.
 *
 * @remarks
 * `td, th { padding: 1px }`, per the
 * {@link https://html.spec.whatwg.org/multipage/rendering.html#tables-2 | HTML rendering rules}.
 * Being a user-agent declaration, it is outranked by any author padding, side
 * by side: a cell which declares `padding-left` alone still gets the default
 * on the three sides it left untouched.
 *
 * @public
 */
export const DEFAULT_CELL_PADDING = 1;

/**
 * The padding properties that can set one side, in the order Yoga resolves
 * them: the first one a style declares is the one that wins.
 *
 * @remarks
 * Source CSS always reaches the plugin expanded per side, but
 * {@link HeuristicTablePluginConfig.getStyleForCell} is hand-written React
 * Native style, where any shorthand is fair game — and a shorthand cannot
 * simply be overwritten, because Yoga resolves a side against its own edge and
 * only falls back to the `padding` edge.
 *
 * This is the single statement of that precedence. `getHorizontalInsets`
 * reads it in order to find the value a side takes;
 * {@link getDefaultCellPaddingStyle} reads {@link PADDING_DECLARERS}, the
 * direction-agnostic union of it, to ask merely whether a side was declared.
 */
export function paddingSourcesFor(
  side: BoxSide,
  rtl: boolean
): readonly (keyof ViewStyle)[] {
  const logical = logicalSideOf(side, rtl);
  if (logical) {
    return [
      `paddingInline${logical}`,
      `padding${logical}`,
      `padding${side}`,
      'paddingInline',
      'paddingHorizontal',
      'padding'
    ] as (keyof ViewStyle)[];
  }
  return [
    `padding${side}`,
    `paddingBlock${side === 'Top' ? 'Start' : 'End'}`,
    'paddingBlock',
    'paddingVertical',
    'padding'
  ] as (keyof ViewStyle)[];
}

/**
 * Every property which declares padding on a given side, in either writing
 * direction.
 *
 * @remarks
 * The union of both directions on purpose. Which physical side a
 * writing-direction keyword lands on is not known when merely asking whether
 * an author declared a side, and reserving both is the harmless choice: it
 * withholds a user-agent default rather than fighting an author declaration.
 */
const PADDING_DECLARERS = BOX_SIDES.reduce(
  (declarers, side) => {
    declarers[side] = [
      ...new Set([
        ...paddingSourcesFor(side, false),
        ...paddingSourcesFor(side, true)
      ])
    ];
    return declarers;
  },
  {} as Record<BoxSide, readonly (keyof ViewStyle)[]>
);

/**
 * The source block style of a node, with its writing direction folded in.
 *
 * @remarks
 * `direction` is a flow property, not a retained box one: the CSS processor
 * files it under `nativeBlockFlow` (`makePropertiesValidators`, the sole
 * member of the block-flow model), and unlike `nativeBlockRet` that bag is
 * inherited — a cell of a `<table style="direction:rtl">` carries `rtl`
 * without declaring it.
 *
 * Every pass which resolves a *logical* edge has to see it: {@link isRTL}
 * here, and `getHorizontalInsets` in `measure`. Reading `nativeBlockRet` alone
 * makes an authored `direction` invisible, so an RTL table resolves its
 * logical borders and padding onto the wrong physical side.
 */
export function getSourceBlockStyle(tnode: TNode): ViewStyle {
  const style = tnode.styles.nativeBlockRet;
  const direction = tnode.styles.nativeBlockFlow?.direction;
  return direction == null ? style : { ...style, direction };
}

/**
 * Whether a node is a table cell, and so subject to the cell rules of the
 * user-agent stylesheet.
 */
export function isTableCell(tnode: TNode): boolean {
  return tnode.tagName === 'td' || tnode.tagName === 'th';
}

/**
 * Everything a node is painted with, the user-agent cell rules included.
 *
 * @remarks
 * `nativeBlockRet` holds source CSS alone, so a cell which declares no padding
 * appears to have none while the renderer gives it
 * {@link DEFAULT_CELL_PADDING}. Any pass which measures a box against what
 * ends up on screen has to reconcile the two here first.
 */
export function getPaintedBlockStyle(
  tnode: TNode
): TNode['styles']['nativeBlockRet'] {
  const style = getSourceBlockStyle(tnode);
  // The same cascade the renderer applies, with no config and no border: a
  // cell measured against anything else would not match what it paints.
  return isTableCell(tnode) ? composeCellStyle(style, null) : style;
}

/**
 * The padding a table cell owes to {@link DEFAULT_CELL_PADDING} alone.
 *
 * @param declaredStyles - Everything the cell declares padding in, source CSS
 * and {@link HeuristicTablePluginConfig.getStyleForCell} alike. A side any of
 * them covers is left out of the result.
 *
 * @remarks
 * The result is expanded per side rather than left as a `padding` shorthand,
 * so that the sides an author did declare stay untouched.
 */
export function getDefaultCellPaddingStyle(
  ...declaredStyles: (ViewStyle | null | undefined)[]
): ViewStyle {
  const resolvedStyle: ViewStyle = {};
  for (const side of BOX_SIDES) {
    const isDeclared = declaredStyles.some((style) =>
      style
        ? PADDING_DECLARERS[side].some((property) => style[property] != null)
        : false
    );
    if (!isDeclared) {
      Object.assign(resolvedStyle, {
        [`padding${side}`]: DEFAULT_CELL_PADDING
      });
    }
  }
  return resolvedStyle;
}

/**
 * Expand callback shorthands so resolved source longhands cannot mask them.
 *
 * @remarks
 * Every shorthand Yoga resolves *after* a per-side edge has to be expanded
 * here, the logical `paddingInline` / `paddingBlock` pair included: a cell
 * declaring `padding-left` in its source CSS reaches the merge as a longhand,
 * which would otherwise win on that one side and leave the callback's
 * shorthand painting the other three — the opposite of the documented rule
 * that callback padding replaces source padding outright.
 *
 * The per-side logical properties (`paddingStart`, `paddingInlineEnd` and
 * friends) need no expansion: Yoga already resolves them ahead of the physical
 * longhands, so they mask the source rather than being masked by it.
 */
export function resolveConfiguredCellStyle(
  style: ViewStyle | null | undefined
): ViewStyle | null {
  if (!style) return null;
  // The shorthands Yoga resolves *after* a per-side edge, in the same order
  // `paddingSourcesFor` states: anything later than `padding<Side>` in that
  // list would otherwise be masked by a source longhand.
  const horizontal =
    style.paddingInline ?? style.paddingHorizontal ?? style.padding;
  const vertical = style.paddingBlock ?? style.paddingVertical ?? style.padding;
  return {
    ...(horizontal != null
      ? { paddingLeft: horizontal, paddingRight: horizontal }
      : null),
    ...(vertical != null
      ? { paddingTop: vertical, paddingBottom: vertical }
      : null),
    ...style
  };
}

/**
 * Merge everything a cell is painted with, in CSS origin order.
 *
 * @remarks
 * Shared by measurement and rendering so the two cannot disagree about what a
 * cell looks like. Lives here rather than in its own module because
 * {@link getPaintedBlockStyle} is defined in terms of it, and
 * {@link getDefaultCellPaddingStyle} in terms of that — three names for one
 * cascade, which would be a cycle if they sat in separate files.
 */
export default function composeCellStyle(
  source: ViewStyle,
  configured: ViewStyle | null,
  {
    border = null,
    rendererDefaults = {},
    paddingSource = source
  }: {
    border?: ViewStyle | null;
    rendererDefaults?: ViewStyle;
    paddingSource?: ViewStyle;
  } = {}
): ViewStyle {
  return {
    ...getDefaultCellPaddingStyle(paddingSource, configured),
    ...source,
    ...rendererDefaults,
    ...configured,
    ...border
  };
}
