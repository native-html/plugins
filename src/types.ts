import { ComponentType } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * An object describing how to generate styles. See {@link cssRulesFromSpecs}.
 *
 * @public
 */
export interface TableStyleSpecs {
  /**
   * Will text be selectable.
   */
  selectableText: boolean;
  /**
   * Expand table to HTML width.
   */
  fitContainerWidth: boolean;
  /**
   * Expand table to HTML height.
   */
  fitContainerHeight: boolean;
  /**
   * Spacing between cells, in em.
   */
  cellPaddingEm: number;
  /**
   * Font size, in pixels.
   *
   * @remarks This value being applied to root, it will affect rem and em.
   */
  fontSizePx: number | null;
  /**
   * Border width, in pixels.
   */
  borderWidthPx: number;
  /**
   * Link of anchors.
   */
  linkColor: string;
  /**
   * Font family.
   *
   * @remarks
   * You will need to do additional work to support non-native fonts.
   */
  fontFamily: string;
  /**
   * Table cell border color.
   */
  tdBorderColor: string;
  /**
   * Table header cell border color.
   */
  thBorderColor: string;
  /**
   * Table even header cell background color.
   */
  thOddBackground: string;
  /**
   * Table odd header cell text color.
   */
  thOddColor: string;
  /**
   * Table even header cell background color.
   */
  thEvenBackground: string;
  /**
   * Table even header cell text color.
   */
  thEvenColor: string;
  /**
   * Table odd row background color.
   */
  trOddBackground: string;
  /**
   * Table odd row text color.
   */
  trOddColor: string;
  /**
   * Table even row background color.
   */
  trEvenBackground: string;
  /**
   * Table even row text color.
   */
  trEvenColor: string;
}

/**
 * @public
 */
export interface TableUndeterminatedHeightState {
  type: 'undeterminated';
  heuristicHeight: number;
}

/**
 * @public
 */
export interface TableDeterminatedHeightState {
  type: 'determinated';
  scrollableHeight: number;
}

/**
 * @public
 */
export type TableHeightState =
  | TableUndeterminatedHeightState
  | TableDeterminatedHeightState;

/**
 * This object defines how the table component can be customized.
 *
 * @public
 */
export interface TableConfig<WebViewProps = any> {
  /**
   * What kind of animation should be used when height is changed?
   *
   * - **layout**: use native `LayoutAnimation`. This is the best option
   *   performance-wise, but requires some setup. See
   *   https://facebook.github.io/react-native/docs/layoutanimation.
   * - **animated**: use `Animated` module from react-native.
   * - **none**: no animations are performed.
   *
   *
   * @defaultValue `"animated"`
   */
  animationType?: 'none' | 'layout' | 'animated';

  /**
   * The animation duration in milliseconds when infered height value changes.
   * See {@link TableConfig.computeContainerHeight}.
   *
   * @defaultValue 120
   */
  animationDuration?: number;

  /**
   * A function which will compute container's height given the height
   * computation state.
   *
   * @remarks
   * For each instance, this function will be called twice. First time on
   * container mount, and second time when the DOM has been mounted inside of
   * `WebView`. At that moment, the state will hold the real content height.
   * See {@link TableHeightState}.
   *
   * @defaultValue A function which will use heuristics before DOM loaded, and
   * real content height after DOM loaded.
   *
   * @returns The container height, or `null` for unconstrained height. In that
   * case, it is advised that you provide a fixed height through `style` prop,
   * otherwise React Native won't be able to figure out the container height
   * and it will not be visible.
   */
  computeContainerHeight?: (state: TableHeightState) => number | null;

  /**
   * A function to compute approximate height before the content height has been
   * fetched on DOM mount.
   *
   * @defaultValue A simple implementation which look at the number of
   * characters and screen width.
   */
  computeHeightHeuristic?: (state: HTMLTableStats) => number;

  /**
   * Override default CSS rules with this prop.
   *
   * @remarks
   * You should at least set a rule which adds a 0-margin to `body` and `html`,
   * otherwise the table will look truncated.
   * When set, `tableStyleSpecs` is ignored. If you want to extend default
   * instead of override CSS styles, look at example bellow.
   *
   * @example
   * ```
   * const cssRules = cssRulesFromSpecs(defaultTableStylesSpecs) + `
   * a {
   *   text-transform: uppercase;
   * }
   * `;
   *
   * const config = {
   *   cssRules,
   *   // Other config options
   * };
   * ```
   */
  cssRules?: string;

  /**
   * See https://git.io/JeCAG
   */
  sourceBaseUrl?: string;

  /**
   * Container style.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Specs to generate css rules.
   *
   * @remarks
   * This prop will be ignored when `cssRules` are provided.
   */
  tableStyleSpecs?: TableStyleSpecs;

  /**
   * The `WebView` Component you wish to use.
   */
  WebView: ComponentType<WebViewProps>;

  /**
   * Any props you'd like to pass to {@link TableConfig.WebView}.
   *
   * @remarks
   * `source` and `javascriptEnabled` will be ignored and overriden. Also, you
   * should pass a stable or memoized object to avoid extraneous renderings.
   * See `React.useMemo`.
   */
  webViewProps?: WebViewProps;
}

/**
 * @public
 */
export interface HTMLTableBaseProps {
  /**
   * The outerHtml of <table> tag.
   */
  html: string;

  /**
   * Intercept links press.
   *
   * **Info**: `makeTableRenderer` uses `HTML.onLinkPress` prop.
   */
  onLinkPress?: (url: string) => void;

  /**
   * Renderers props.
   */
  renderersProps: any;
}

/**
 * @public
 */
export interface HTMLTableStats {
  /**
   * Number of rows, header included
   */
  numOfRows: number;

  /**
   * Number of columns.
   */
  numOfColumns: number;

  /**
   * Number of text characters.
   */
  numOfChars: number;
}

/**
 * @public
 */
export interface HTMLTablePropsWithStats
  extends HTMLTableBaseProps,
    HTMLTableStats {}

/**
 * @public
 */
export interface HTMLTableProps<WVP>
  extends TableConfig<WVP>,
    HTMLTablePropsWithStats {}
