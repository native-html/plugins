/**
 * The largest `colspan` HTML allows, and the value `extractColumnWidths` uses
 * for the `span` attribute of `col` and `colgroup`, which shares the limit.
 */
export const MAX_COLSPAN = 1000;

/** The largest `rowspan` HTML allows. */
export const MAX_ROWSPAN = 65534;

/**
 * Parse a `colspan`, `rowspan` or `span` attribute the way HTML requires.
 *
 * @remarks
 * The attribute is a non-negative integer, clamped to a maximum; anything
 * invalid — a missing value, a negative, a fraction, `0`, or plain nonsense —
 * falls back to `1`. Letting a raw `Number()` through instead lets `0` and
 * negatives corrupt the grid cursor.
 *
 * Note that `rowspan="0"` means "span to the end of the row group" in HTML.
 * Row groups are not modelled here, so it degrades to `1` rather than
 * silently spanning nothing.
 */
export default function parseSpan(value: unknown, max = MAX_COLSPAN): number {
  const parsed = typeof value === 'string' ? Number(value.trim()) : NaN;
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.min(Math.max(Math.floor(parsed), 1), max);
}
