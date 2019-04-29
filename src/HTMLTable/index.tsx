import React, { PureComponent, ComponentType } from 'react'
import PropTypes from 'prop-types'
import { Platform, View, StyleSheet, NativeSyntheticEvent, WebViewMessageEventData, Dimensions, LayoutAnimation } from 'react-native'
import cssStylesFromSpecs from './css-styles'
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
}

const defaultInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
}

function animateNextFrames() {
  LayoutAnimation.configureNext({
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut
    }
  })
}

const DEFAULT_CONTAINER_HEIGHT = Math.max(
  Dimensions.get('window').height,
  Dimensions.get('window').width) / 2

export default class HTMLTable<WVP = any> extends PureComponent<TableProps<WVP>, State> {

  static defaultProps = {
    autoheight: true
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
    webViewProps: PropTypes.object
  }

  state: State = {
    containerHeight: 0
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
    const tableCssStyle = cssRules ? cssRules : cssStylesFromSpecs(styleSpecs)
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

  private findHeight() {
    const { containerHeight } = this.state
    const { autoheight, defaultHeight, maxHeight } = this.props
    const computedHeight = autoheight ?
                               containerHeight ? containerHeight : DEFAULT_CONTAINER_HEIGHT :
                               defaultHeight
    if (maxHeight) {
      return Math.min(maxHeight, computedHeight as number)
    }
    return computedHeight
  }

  componentWillUpdate(_nextProps: TableProps, nextState: State) {
    if (nextState.containerHeight !== this.state.containerHeight) {
      animateNextFrames()
    }
  }

  render() {
    const {
          style,
          WebViewComponent,
          webViewProps
        } = this.props
    const html = this.buildHTML()
    const source = {
      html
    }
    const WebView = WebViewComponent as ComponentType<any>
    const containerStyle = {
      height: this.findHeight()
    }
    return (
          <View style={[containerStyle, styles.container, style]}>
            <WebView scalesPageToFit={Platform.select({ android: false, ios: undefined })}
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={true}
                    style={StyleSheet.absoluteFill}
                    contentInset={defaultInsets}
                    {...webViewProps}
                    injectedJavaScript={script}
                    javaScriptEnabled={true}
                    onMessage={this.handleOnMessage}
                    source={source}/>
          </View>
    )
  }
}
