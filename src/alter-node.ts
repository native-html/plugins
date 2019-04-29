import { HtmlAttributesDictionary, HTMLNode } from 'react-native-render-html'
import forEachObjIndexed from 'ramda/es/forEachObjIndexed'
import strigifyEntities from 'stringify-entities'

function renderOpeningTag(tag: string, attributes: HtmlAttributesDictionary) {
  const strAttributes: string[] = []
  forEachObjIndexed((attrVal: string, attrKey: string) => {
    strAttributes.push(`${attrKey}="${strigifyEntities(attrVal)}"`)
  })(attributes)
  return `<${tag}${strAttributes.length ? ' ' : ''}${strAttributes.join(' ')}>`
}

export function domToHTML(root: HTMLNode): string {
  if (root.type === 'tag') {
    const strChildren = root.children.reduce((prev: string, curr: HTMLNode) => `${prev}${domToHTML(curr)}`, '')
    return `${renderOpeningTag(root.name, root.attribs)}${strChildren}</${root.name}>`
  }
  if (root.type === 'text') {
    return strigifyEntities(root.data)
  }
  return ''
}

export default function alterNode(node: HTMLNode) {
  if (node.type === 'tag' && node.name === 'table') {
    node.attribs.cellspacing = '0'
    node.attribs.rawHtml = domToHTML(node)
  }
}
