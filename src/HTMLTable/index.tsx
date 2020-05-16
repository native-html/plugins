import React, { PureComponent, ComponentType } from 'react'
import PropTypes from 'prop-types'
import { Platform, StyleSheet, Dimensions, LayoutAnimation, Animated, StyleProp, ViewStyle, NativeSyntheticEvent } from 'react-native'
import cssRulesFromSpecs, { TableStyleSpecs, defaultTableStylesSpecs } from './css-rules'
import script from './script'
export { IGNORED_TAGS, TABLE_TAGS } from './tags'

export { TableStyleSpecs, defaultTableStylesSpecs, cssRulesFromSpecs }

export interface TableConfig<WebViewProps = any> {
  /**
   * The `WebView` Component you wish to use.
   *
   * **Warning** Features such as `autoheight` and `onLinkPress` don't work with legacy, core version.
   * Please use latest community version instead, https://github.com/react-native-community/react-native-webview
   */
  WebViewComponent: ComponentType<WebViewProps>

  /**
   * Fit height to HTML content.
   *
   * **default** `true`
   *
   * **Warning** Works with `WebView` community edition &ge;5.0.0 and Expo SDK &ge;33.
   */
  autoheight?: boolean

  /**
   * If `autoheight` is set to `true`, the container will span to `defaultHeight` during content height computation.
   * Otherwise, container height will be fixed to `defaultHeight` before and after height computation.
   */
  defaultHeight?: number

  /**
   * Maximum container height.
   * Content will be scrollable on overflow.
   */
  maxHeight?: number

  /**
   * Container style.
   */
  style?: StyleProp<ViewStyle>

  /**
   * Specs to generate css rules.
   *
   * **Info**: ignored if `cssRules` are provided.
   */
  tableStyleSpecs?: TableStyleSpecs

  /**
   * Override default CSS rules with this prop.
   */
  cssRules?: string

  /**
   * Any props you'd like to pass to WebView component
   *
   * **Info**: `source`, `javascriptEnabled`
   * will be ignored and overriden.
   */
  webViewProps?: WebViewProps

  /**
   * Use native `LayoutAnimation` instead of `Animated` module with `autoheight`
   *
   * **Info**: It requires some setup on Android.
   */
  useLayoutAnimations?: boolean,

  /**
   * The transition duration in milliseconds when table height is updated when `autoheight` is used.
   *
   * **default**: `120`
   */
  transitionDuration?: number

  /**
   * See https://git.io/JeCAG
   */
  sourceBaseUrl?: string
}

export interface HTMLTableBaseProps {
  /**
   * The outerHtml of <table> tag.
   */
  html: string

  /**
   * Intercept links press.
   *
   * **Info**: `makeTableRenderer` uses `<HTML>onLinkPress` prop.
   */
  onLinkPress?: (url: string) => void

  /**
   * Renderers props.
   */
  renderersProps: any
}

export interface HTMLTablePropsWithStats extends HTMLTableBaseProps {
  /**
   * Number of rows, header included
   */
  numOfRows: number

  /**
   * Number of columns.
   */
  numOfColumns: number

  /**
   * Number of text characters.
   */
  numOfChars: number
}

interface PostMessage {
  type: 'heightUpdate' | 'navigateEvent',
  content: any
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // See https://github.com/react-native-community/react-native-webview/issues/101
    overflow: 'hidden'
  }
})

interface State {
  containerHeight: number
  animatedHeight: Animated.Value
}

const defaultInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
}

const DEFAULT_TRANSITION_DURATION = 120

function animateNextFrames(duration?: number) {
  LayoutAnimation.configureNext({
    duration: duration || DEFAULT_TRANSITION_DURATION,
    update: {
      type: LayoutAnimation.Types.easeInEaseOut
    }
  })
}

export interface HTMLTableProps<WVP> extends TableConfig<WVP>, HTMLTablePropsWithStats {}

const tableStylePropTypeSpec: Record<keyof TableStyleSpecs, any> = {
  linkColor: PropTypes.string.isRequired,
  fontFamily: PropTypes.string.isRequired,
  tdBorderColor: PropTypes.string.isRequired,
  thBorderColor: PropTypes.string.isRequired,
  trOddBackground: PropTypes.string.isRequired,
  trOddColor: PropTypes.string.isRequired,
  trEvenBackground: PropTypes.string.isRequired,
  trEvenColor: PropTypes.string.isRequired,
  borderWidthPx:  PropTypes.number.isRequired,
  cellPaddingEm: PropTypes.number.isRequired,
  fitContainer: PropTypes.bool.isRequired,
  selectableText: PropTypes.bool.isRequired,
  thEvenBackground: PropTypes.string.isRequired,
  thEvenColor: PropTypes.string.isRequired,
  thOddBackground: PropTypes.string.isRequired,
  thOddColor: PropTypes.string.isRequired
}

interface WebViewMessage {
  data: string
}

export default class HTMLTable<WVP extends Record<string, any>> extends PureComponent<HTMLTableProps<WVP>, State> {

  static defaultProps: Partial<Record<keyof HTMLTableProps<any>, any>> = {
    autoheight: true,
    useLayoutAnimations: false,
    transitionDuration: DEFAULT_TRANSITION_DURATION
  }

  static propTypes: Record<keyof HTMLTableProps<any>, any> = {
    html: PropTypes.string.isRequired,
    numOfChars: PropTypes.number.isRequired,
    numOfColumns: PropTypes.number.isRequired,
    numOfRows: PropTypes.number.isRequired,
    WebViewComponent: PropTypes.func.isRequired,
    autoheight: PropTypes.bool,
    defaultHeight: PropTypes.number,
    maxHeight: PropTypes.number,
    onLinkPress: PropTypes.func,
    style: PropTypes.any,
    tableStyleSpecs: PropTypes.shape(tableStylePropTypeSpec),
    cssRules: PropTypes.string,
    webViewProps: PropTypes.object,
    useLayoutAnimations: PropTypes.bool,
    transitionDuration: PropTypes.number,
    sourceBaseUrl: PropTypes.string,
    renderersProps: PropTypes.any
  }

  private oldContainerHeight: number = 0

  constructor(props: HTMLTableProps<WVP>) {
    super(props)
    const state = {
      containerHeight: 0,
      animatedHeight: new Animated.Value(0)
    }
    this.state = state
    this.oldContainerHeight = this.findHeight(this.props, this.state) || 0
  }

  private handleOnMessage = ({ nativeEvent }: NativeSyntheticEvent<WebViewMessage>) => {
    const parsedJSON = (() => {
      try {
        return JSON.parse(nativeEvent.data) as PostMessage
      } catch (e) {
        return null
      }
    })()

    if (parsedJSON && typeof parsedJSON === 'object') {
      const { type, content } = parsedJSON
      if (type === 'heightUpdate') {
        const containerHeight = content
        if (typeof containerHeight === 'number' && !Number.isNaN(containerHeight)) {
          this.setState({ containerHeight })
        }
      }
      if (type === 'navigateEvent') {
        const { onLinkPress } = this.props
        onLinkPress && onLinkPress(content)
      }
    }

    if (this.props.webViewProps && typeof this.props.webViewProps.onMessage === 'function') {
      this.props.webViewProps.onMessage(nativeEvent)
    }
  }

  private buildHTML() {
    const {
        autoheight,
        tableStyleSpecs,
        cssRules,
        html
      } = this.props
    const styleSpecs = tableStyleSpecs ? tableStyleSpecs : {
      ...defaultTableStylesSpecs,
      fitContainer: !autoheight
    }
    const tableCssStyle = cssRules ? cssRules : cssRulesFromSpecs(styleSpecs)
    return `
      <!DOCTYPE html>
      <html>
      <head>
      <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=false">
      </head>
      <body>
        <style>
        ${tableCssStyle}
        </style>
        ${html}
      </body>
      </html>
      `
  }

  private computeHeightHeuristic() {
    const { numOfChars, numOfRows } = this.props
    const width = Dimensions.get('window').width
    const charsPerLine = 30 * width / 400
    const lineHeight = 20
    const approxNumOfLines = Math.floor(numOfChars / charsPerLine)
    return Math.max(approxNumOfLines, numOfRows) * lineHeight
  }

  private findHeight(props: HTMLTableProps<WVP>, state: State) {
    const { containerHeight } = state
    const { autoheight, defaultHeight, maxHeight } = props
    const computedHeight = autoheight ?
                               containerHeight ? containerHeight : this.computeHeightHeuristic() :
                               defaultHeight
    if (maxHeight) {
      return Math.min(maxHeight, computedHeight as number)
    }
    return computedHeight
  }

  componentDidUpdate(_oldProps: HTMLTableProps<WVP>, oldState: State) {
    const { autoheight, useLayoutAnimations, transitionDuration } = this.props
    const shouldAnimate = oldState.containerHeight !== this.state.containerHeight && autoheight
    if (shouldAnimate && !useLayoutAnimations) {
      this.oldContainerHeight = oldState.containerHeight
      Animated.timing(this.state.animatedHeight, {
        toValue: 1,
        duration: transitionDuration
      }).start()
    }
    if (shouldAnimate && useLayoutAnimations) {
      animateNextFrames(transitionDuration)
    }
  }

  render() {
    const {
        autoheight,
        style,
        WebViewComponent,
        webViewProps,
        useLayoutAnimations,
        sourceBaseUrl
      } = this.props
    const html = this.buildHTML()
    const source: any = {
      html
    }
    if (sourceBaseUrl) {
      source.baseUrl = sourceBaseUrl
    }
    const containerHeight = this.findHeight(this.props, this.state)
    const WebView = WebViewComponent as ComponentType<any>
    const containerStyle = autoheight && !useLayoutAnimations ? {
      height: this.state.animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [this.oldContainerHeight, containerHeight as number]
      })
    } : {
      height: !containerHeight || Number.isNaN(containerHeight) ? undefined : containerHeight
    }
    return (
          <Animated.View style={[containerStyle, styles.container, style]}>
            <WebView scalesPageToFit={Platform.select({ android: false, ios: undefined })}
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={true}
                    style={[StyleSheet.absoluteFill, webViewProps && webViewProps.style]}
                    contentInset={defaultInsets}
                    {...webViewProps}
                    injectedJavaScript={script + '\n' + (webViewProps && webViewProps.injectedJavaScript)}
                    javaScriptEnabled={true}
                    onMessage={this.handleOnMessage}
                    source={source}/>
          </Animated.View>
    )
  }
}
