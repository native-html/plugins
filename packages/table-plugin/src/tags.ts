import { IGNORED_TAGS as ORIGINAL_IGNORED_TAGS } from 'react-native-render-html/src/HTMLUtils';

function without<T>(undesired: T[], original: T[]): T[] {
  return original.filter((v) => undesired.indexOf(v) === -1);
}

/**
 * All HTML tags associated with a table element.
 *
 * @public
 */
export const TABLE_TAGS = [
  'table',
  'caption',
  'col',
  'colgroup',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr'
];

/**
 * A new list of tags to ignore, which exclude {@link TABLE_TAGS}.
 *
 * @public
 */
export const IGNORED_TAGS = without(TABLE_TAGS, ORIGINAL_IGNORED_TAGS);
