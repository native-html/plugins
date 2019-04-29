import { ComponentType } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { TableConfig } from "./table-config"

export interface TableProps<WebViewProps = any> extends TableConfig<WebViewProps> {
    /**
     * The outerHtml of <table> tag.
     */
    rawHtml: string
}
