import React, { PureComponent, ComponentType } from 'react'
import PropTypes from 'prop-types'
import { Platform, StyleSheet, NativeSyntheticEvent, WebViewMessageEventData, Dimensions, LayoutAnimation, Animated } from 'react-native'
import cssRulesFromSpecs from './css-rules'
import { TableProps } from './types'
import script from './script'
export { IGNORED_TAGS, TABLE_TAGS } from './tags'

export { TableProps } from './types'

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

const DEFAULT_CONTAINER_HEIGHT = Math.max(
  Dimensions.get('window').height,
  Dimensions.get('window').width) / 2

export default class HTMLTable<WVP extends Record<string, any>> extends PureComponent<TableProps<WVP>, State> {

  static defaultProps = {
    autoheight: true,
    useLayoutAnimations: false,
    transitionDuration: DEFAULT_TRANSITION_DURATION
  }

  static propTypes = {
    rawHtml: PropTypes.string.isRequired,
    WebViewComponent: PropTypes.func.isRequired,
    autoheight: PropTypes.bool,
    defaultHeight: PropTypes.number,
    maxHeight: PropTypes.number,
    onLinkPress: PropTypes.func,
    style: PropTypes.any,
    tableStyleSpecs: PropTypes.shape({
      linkColor: PropTypes.string.isRequired,
      fontFamily: PropTypes.string.isRequired,
      tdBorderColor: PropTypes.string.isRequired,
      thBorderColor: PropTypes.string.isRequired,
      thBackground: PropTypes.string.isRequired,
      thColor: PropTypes.string.isRequired,
      trOddBackground: PropTypes.string.isRequired,
      trOddColor: PropTypes.string.isRequired,
      trEvenBackground: PropTypes.string.isRequired,
      trEvenColor: PropTypes.string.isRequired
    }),
    cssRules: PropTypes.string,
    webViewProps: PropTypes.object,
    useLayoutAnimations: PropTypes.bool,
    transitionDuration: PropTypes.number
  }

  private oldContainerHeight: number = 0

  constructor(props: TableProps) {
    super(props)
    const state = {
      containerHeight: 0,
      animatedHeight: new Animated.Value(0)
    }
    this.state = state
    this.oldContainerHeight = this.findHeight(this.props, this.state) || 0
  }

  private handleOnMessage = ({ nativeEvent }: NativeSyntheticEvent<WebViewMessageEventData>) => {
    const { type, content } = JSON.parse(nativeEvent.data) as PostMessage
    if (type === 'heightUpdate') {
      const containerHeight = content
      if (typeof containerHeight === 'number' && !Number.isNaN(containerHeight)) {
        this.setState({ containerHeight })
      }
    }
    if (type === 'navigateEvent') {
      const { onLinkPress } = this.props
      const url = content
      onLinkPress && onLinkPress(url)
    }
  }

  private buildHTML() {
    const {
        tableStyleSpecs: styleSpecs,
        cssRules,
        rawHtml
      } = this.props
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
        ${rawHtml}
      </body>
      </html>
      `
  }

  private findHeight(props: TableProps, state: State) {
    const { containerHeight } = state
    const { autoheight, defaultHeight, maxHeight } = props
    const computedHeight = autoheight ?
                               containerHeight ? containerHeight : DEFAULT_CONTAINER_HEIGHT :
                               defaultHeight
    if (maxHeight) {
      return Math.min(maxHeight, computedHeight as number)
    }
    return computedHeight
  }

  componentWillUpdate(_nextProps: TableProps, nextState: State) {
    const { autoheight, useLayoutAnimations, transitionDuration } = this.props
    const shouldAnimate = nextState.containerHeight !== this.state.containerHeight &&
                          autoheight && useLayoutAnimations
    if (shouldAnimate) {
      animateNextFrames(transitionDuration)
    }
  }

  componentDidUpdate(_oldProps: TableProps, oldState: State) {
    const { autoheight, useLayoutAnimations, transitionDuration } = this.props
    const shouldAnimate = oldState.containerHeight !== this.state.containerHeight &&
                          autoheight && !useLayoutAnimations
    if (shouldAnimate) {
      this.oldContainerHeight = oldState.containerHeight
      Animated.timing(this.state.animatedHeight, {
        toValue: 1,
        duration: transitionDuration
      }).start()
    }
  }

  render() {
    const {
        autoheight,
        style,
        WebViewComponent,
        webViewProps,
        useLayoutAnimations
      } = this.props
    const html = this.buildHTML()
    const source = {
      html
    }
    const containerHeight = this.findHeight(this.props, this.state)
    const WebView = WebViewComponent as ComponentType<any>
    const containerStyle = autoheight && !useLayoutAnimations ? {
      height: this.state.animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [this.oldContainerHeight, containerHeight as number]
      })
    } : {
      height: containerHeight
    }
    return (
          <Animated.View style={[containerStyle, styles.container, style]}>
            <WebView scalesPageToFit={Platform.select({ android: false, ios: undefined })}
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={true}
                    style={[StyleSheet.absoluteFill, webViewProps && webViewProps.style]}
                    contentInset={defaultInsets}
                    {...webViewProps}
                    injectedJavaScript={script}
                    javaScriptEnabled={true}
                    onMessage={this.handleOnMessage}
                    source={source}/>
          </Animated.View>
    )
  }
}
