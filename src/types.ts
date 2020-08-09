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
 * This object defines how the table component can be customized.
 *
 * @public
 */
export interface TableConfig<WebViewProps = any> {
  /**
   * The `WebView` Component you wish to use.
   *
   * @remarks
   * Features such as `autoheight` and `onLinkPress` don't work with legacy,
   * core version. Please use latest community version instead,
   * https://github.com/react-native-community/react-native-webview
   */
  WebViewComponent: ComponentType<WebViewProps>;

  /**
   * Fit height to HTML content.
   *
   * @defaultValue true
   *
   * @remarks
   * The operation is dynamic, because it requires the DOM to be mounted, and a
   * script be executed to send height through the `WebView` component. Works
   * with `WebView` community edition &ge;5.0.0 and Expo SDK &ge;33.
   *
   * @remarks
   * When setting to `false`, you must either give container absolute
   * positioning with `style` prop, or give a fixed height with `defaultHeight`
   * prop. Otherwise, React Native will assign a `0` height.
   */
  autoheight?: boolean;

  /**
   * If `autoheight` is set to `true`, `defaultHeight` will be ignored.
   * Otherwise, container height will be fixed to `defaultHeight`.
   */
  defaultHeight?: number;

  /**
   * Maximum container height.
   * Content will be scrollable on overflow.
   *
   * @remarks
   * Content should theoretically be scrollable on overflow, but there is a
   * [**pending
   * issue**](https://github.com/react-native-community/react-native-webview/issues/22)
   * in `react-native-community/react-native-webview` which prevents `WebView`
   * nested in a `ScrollView` to be scrollable.
   */
  maxHeight?: number;

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
   * Any props you'd like to pass to {@link TableConfig.WebViewComponent}.
   *
   * @remarks
   * `source` and `javascriptEnabled` will be ignored and overriden.
   */
  webViewProps?: WebViewProps;

  /**
   * Use native `LayoutAnimation` instead of `Animated` module with
   * `autoheight`.
   *
   * @remarks
   * This should be preferred performance-wise, but you need to setup
   * `UIManager` on android. See official guide:
   * https://facebook.github.io/react-native/docs/layoutanimation
   *
   * @defaultValue false
   */
  useLayoutAnimations?: boolean;

  /**
   * The transition duration in milliseconds when table height is updated when `autoheight` is used.
   *
   * @defaultValue 120
   */
  transitionDuration?: number;

  /**
   * See https://git.io/JeCAG
   */
  sourceBaseUrl?: string;
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
   * **Info**: `makeTableRenderer` uses `<HTML>onLinkPress` prop.
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
export interface HTMLTableStatProps {
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
    HTMLTableStatProps {}

/**
 * @public
 */
export interface HTMLTableProps<WVP>
  extends TableConfig<WVP>,
    HTMLTablePropsWithStats {}
