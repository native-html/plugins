import { HtmlAttributesDictionary, HTMLNode } from 'react-native-render-html'
import forEachObjIndexed from 'ramda/es/forEachObjIndexed'
import strigifyEntities from 'stringify-entities'

function renderOpeningTag(tag: string, attributes: HtmlAttributesDictionary) {
  const strAttributes: string[] = []
  forEachObjIndexed((attrVal: string|number, attrKey: string) => {
    strAttributes.push(`${attrKey}="${strigifyEntities(`${attrVal}`)}"`)
  })(attributes)
  return `<${tag}${strAttributes.length ? ' ' : ''}${strAttributes.join(' ')}>`
}

interface TableStats {
  rows: number
  columns: number
  characters: number
}

function domToHTML(root: HTMLNode, stats: TableStats): string {
  let html = ''
  if (root.type === 'tag') {
    const strChildren = root.children.reduce((prev: string, curr: HTMLNode) => {
      if (curr.type === 'tag' && curr.name === 'tr') {
        stats.rows += 1
      }
      if (curr.type === 'tag' && (curr.name === 'td' || curr.name === 'th') && stats.rows === 1) {
        stats.columns += 1
      }
      return `${prev}${domToHTML(curr, stats)}`
    }, '')
    html = `${renderOpeningTag(root.name, root.attribs)}${strChildren}</${root.name}>`
  } else if (root.type === 'text') {
    const text = strigifyEntities(root.data)
    html = text
    stats.characters += text.length
  }
  return html
}

/**
 * This function should be passed to HTML component.
 * 
 * @param node - A node from htmlparser2 library.
 * 
 * @public
 */
export function alterNode(node: HTMLNode) {
  if (node.type === 'tag' && node.name === 'table') {
    const stats = {
      html: '',
      rows: 0,
      columns: 0,
      characters: 0
    }
    node.attribs.cellspacing = '0'
    const html = domToHTML(node, stats)
    const { rows, columns, characters } = stats
    node.attribs._rawHtml = html
    node.attribs._numOfRows = rows
    node.attribs._numOfColumns = columns
    node.attribs._numOfChars = characters
  }
}
