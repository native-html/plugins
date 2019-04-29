import React from 'react'
import { RendererDeclaration } from "react-native-render-html"
import Table, { TableProps } from "./HTMLTable"
import { Omit } from 'ramda'

export type TableRendererConfig = Omit<TableProps, 'rawHtml'>

function makeTableRenderer(tableConfig: TableRendererConfig): RendererDeclaration {
    return (attribs, _children, _css, { key }) => {
        return <Table key={key} {...tableConfig} rawHtml={attribs.rawHtml} />
    }
}

export default makeTableRenderer