import { ComponentType } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { TableConfig } from './table-config'

export interface TableProps<WebViewProps = any> extends TableConfig<WebViewProps> {
  /**
   * The outerHtml of <table> tag.
   */
  rawHtml: string

  /**
   * Intercept links press.
   * 
   * **Info**: `makeTableRenderer` uses `<HTML>onLinkPress` prop.
   */
  onLinkPress?: (url: string) => void
}
