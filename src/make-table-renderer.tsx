import React from 'react'
import { RendererDeclaration } from 'react-native-render-html'
import Table, { TableProps } from './HTMLTable'
import { Omit } from 'ramda'

export type TableRendererConfig = Omit<TableProps, 'rawHtml'|'onLinkPress'>

function makeTableRenderer(tableConfig: TableRendererConfig): RendererDeclaration {
  return (attribs, _children, _css, { key, onLinkPress }) => {
    const handleOnLinkPress = (url: string) => onLinkPress && onLinkPress({} as any, url, {})
    return <Table key={key} {...tableConfig} rawHtml={attribs.rawHtml} onLinkPress={handleOnLinkPress} />
  }
}

export default makeTableRenderer
