import without from 'ramda/es/without'
import { IGNORED_TAGS as ORIGINAL_IGNORED_TAGS } from 'react-native-render-html/src/HTMLUtils'

/**
 * @public
 */
export const TABLE_TAGS = ['table', 'caption', 'col', 'colgroup', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr']
/**
 * @public
 */
export const IGNORED_TAGS = without(TABLE_TAGS, ORIGINAL_IGNORED_TAGS)
