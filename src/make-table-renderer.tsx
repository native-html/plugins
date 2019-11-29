import React, { ComponentType } from 'react'
import { RendererDeclaration } from 'react-native-render-html'
import HTMLTable, { TableConfig, HTMLTablePropsWithStats } from './HTMLTable'

export function makeTableRenderer(tableConfig: TableConfig): RendererDeclaration {
  return (attribs, _children, _css, { key, onLinkPress, renderersProps }) => {
    const handleOnLinkPress = (url: string) => onLinkPress && onLinkPress({} as any, url, {})
    if (typeof attribs._rawHtml !== 'string') {
      throw new Error("You must inject `alterNode' method from react-native-render-html-table-bdridge in `HTML' component.")
    }
    return <HTMLTable key={key}
                  {...tableConfig}
                  numOfColumns={attribs._numOfColumns as number}
                  numOfRows={attribs._numOfRows as number}
                  numOfChars={attribs._numOfChars as number}
                  html={attribs._rawHtml as string}
                  renderersProps={renderersProps}
                  onLinkPress={handleOnLinkPress} />
  }
}

/**
 * 
 * @param TableComponent A component which will receive `HTMLTablePropsWithStats` props.
 * @see HTMLTablePropsWithStats
 */
export function makeCustomTableRenderer(TableComponent: ComponentType<HTMLTablePropsWithStats>): RendererDeclaration {
  return (attribs, _children, _css, { key, onLinkPress, renderersProps }) => {
    const handleOnLinkPress = (url: string) => onLinkPress && onLinkPress({} as any, url, {})
    if (typeof attribs._rawHtml !== 'string') {
      throw new Error("You must inject `alterNode' method from react-native-render-html-table-bdridge in `HTML' component.")
    }
    return <TableComponent key={key}
                  numOfColumns={attribs._numOfColumns as number}
                  numOfRows={attribs._numOfRows as number}
                  numOfChars={attribs._numOfChars as number}
                  html={attribs._rawHtml as string}
                  renderersProps={renderersProps}
                  onLinkPress={handleOnLinkPress} />
  }
}
