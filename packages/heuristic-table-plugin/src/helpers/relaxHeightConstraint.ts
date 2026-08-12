import type { ViewStyle } from 'react-native';

type HeightConstraints = Pick<ViewStyle, 'height' | 'minHeight'>;

/**
 * Fold an explicit `height` into a `minHeight` constraint.
 *
 * @remarks
 * Per {@link https://www.w3.org/TR/CSS21/tables.html#height-layout | CSS 2.1
 * §17.5.3}, the `height` property of `table`, `tr`, `th` and `td` boxes only
 * defines a *minimum* height: those boxes always grow to fit their content.
 * React Native has no table layout algorithm, so passing that `height` down to
 * a `View` would enforce it, and taller content would overflow (or be clipped)
 * instead of expanding the cell. `minHeight` conveys the HTML semantic
 * faithfully.
 *
 * @param style - Native styles of a `table`, `tr`, `th` or `td` element.
 *
 * @returns The same styles, with `height` removed and merged into `minHeight`.
 */
export default function relaxHeightConstraint<T extends HeightConstraints>(
  style: T
): Omit<T, 'height'> {
  const { height, ...rest } = style;
  if (height == null) {
    return rest;
  }
  const minHeight =
    typeof height === 'number' && typeof rest.minHeight === 'number'
      ? Math.max(height, rest.minHeight)
      : rest.minHeight ?? height;
  return { ...rest, minHeight };
}
