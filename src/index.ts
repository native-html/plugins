import makeTableRenderer from './make-table-renderer'
import alterNode, { domToHTML } from './alter-node'
import HTMLTable, { TableConfig, TableStyleSpecs, defaultTableStylesSpecs, cssRulesFromSpecs } from './HTMLTable'

export {
    IGNORED_TAGS,
    TABLE_TAGS
} from './HTMLTable'

export {
    defaultTableStylesSpecs,
    cssRulesFromSpecs,
    alterNode,
    domToHTML,
    makeTableRenderer,
    HTMLTable,
    TableConfig,
    TableStyleSpecs
}
