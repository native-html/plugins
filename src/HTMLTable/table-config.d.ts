import { ComponentType } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { TableStyleSpecs } from "./table-specs"

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
     * **Warning** Works with `WebView` community only.
     */
    autoheight?: boolean
    /**
     * Behavior changes depending on other props.
     * If `autoheight` is set to `true, the container will span to this height during content height computation.
     * Otherwise, container height will be forced to `defaultHeight`.
     */
    defaultHeight?: number
    /**
     * Maximum container height.
     * scrolls on overflow.    
     */
    maxHeight?: number
    /**
     * Intercept links press.
     * 
     * **Info**: `makeTableRenderer` uses `<HTML>onLinkPress` prop.
     */
    onLinkPress?: (url: string) => void
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
     * **Info**: `source` and `onShouldStartLoadWithRequest` will be ignored
     */
    webViewProps?: WebViewProps
}