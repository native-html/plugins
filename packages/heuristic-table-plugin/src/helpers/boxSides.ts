import { I18nManager, ViewStyle } from 'react-native';

/** The four physical edges of a box, spelled as React Native style suffixes. */
export type BoxSide = 'Bottom' | 'Left' | 'Right' | 'Top';

export const BOX_SIDES = ['Top', 'Right', 'Bottom', 'Left'] as const;

/**
 * Whether a style resolves its logical edges right-to-left.
 *
 * @remarks
 * An explicit `direction` wins; otherwise the app-wide setting decides, which
 * is what Yoga itself does with an unset direction.
 */
export function isRTL(style: ViewStyle): boolean {
  return (
    style.direction === 'rtl' ||
    (style.direction !== 'ltr' && I18nManager.isRTL)
  );
}

/** The logical edge a physical horizontal side maps to, or `null` vertically. */
export function logicalSideOf(side: BoxSide, rtl: boolean): 'End' | 'Start' | null {
  if (side === 'Left') return rtl ? 'End' : 'Start';
  if (side === 'Right') return rtl ? 'Start' : 'End';
  return null;
}
