import React, { PureComponent, ComponentType } from "react"
import { TableStyleSpecs } from "./types"
import cssStylesFromSpecs from "./css-styles"
import { Platform, StyleProp, ViewStyle, WebViewProps, WebViewIOSLoadRequestEvent } from "react-native"

export interface TableProps {
    rawHtml: string
    WebViewComponent: ComponentType<any>
    /**
     * Intercept links press.
     */
    onPressLink?: (url: string) => void
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
}

export default class HTMLTable extends PureComponent<TableProps> {

    private handleOnShouldStartLoadWithRequest = ({ url }: WebViewIOSLoadRequestEvent) => {
        const { onPressLink } = this.props
        onPressLink && onPressLink(url)
        return !url
    }

    render() {
        const { tableStyleSpecs: styleSpecs, cssRules, rawHtml, style, WebViewComponent } = this.props
        const tableCssStyle = cssRules ? cssRules : cssStylesFromSpecs(styleSpecs)
        const html = `
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
        const source = {
          html
        }
        const WebView = WebViewComponent as ComponentType<WebViewProps>
        return (
          <WebView scalesPageToFit={Platform.select({ android: false, ios: undefined })}
                   automaticallyAdjustContentInsets={false}
                   javaScriptEnabled={false}
                   scrollEnabled={true}
                   onShouldStartLoadWithRequest={this.handleOnShouldStartLoadWithRequest}
                   style={style}
                   contentInset={{ top: 0, bottom: 0, left: 0, right: 0 }}
                   source={source} />
        )
      }
}