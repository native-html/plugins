/**
 * How `border-spacing` is spent across a table, in one place.
 *
 * @remarks
 * These two figures and the renderer must agree, and they are derived rather
 * than restated: {@link TreeRenderer} realises the same algebra as a
 * `paddingHorizontal` on the table root plus a `marginEnd` on every cell that
 * is not in the last column, which is exactly
 * `2 * spacing + (columns - 1) * spacing` — the total below.
 */

/**
 * The gap a cell spanning `lenX` columns swallows.
 *
 * @remarks
 * A spanning cell covers the boundaries *between* the columns it spans, so its
 * own box absorbs that spacing instead of the table painting it.
 */
export function spanInternalSpacing(lenX: number, spacing: number): number {
  return Math.max(0, lenX - 1) * spacing;
}

/**
 * The spacing a table spends in total: one gap between each pair of adjacent
 * columns, plus one at each outer edge.
 *
 * @param maxX - The last occupied column index, so the table has `maxX + 1`
 * columns and `maxX + 2` gaps.
 */
export function totalHorizontalSpacing(maxX: number, spacing: number): number {
  return (maxX + 2) * spacing;
}
