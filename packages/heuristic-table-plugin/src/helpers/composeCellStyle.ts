import { ViewStyle } from 'react-native';
import { getDefaultCellPaddingStyle } from './tableStyles';

/** Shared precedence for measurement and rendering; config is normalized first. */
export default function composeCellStyle(
  source: ViewStyle,
  configured: ViewStyle | null,
  {
    border = null,
    rendererDefaults = {},
    paddingSource = source
  }: {
    border?: ViewStyle | null;
    rendererDefaults?: ViewStyle;
    paddingSource?: ViewStyle;
  } = {}
): ViewStyle {
  return {
    ...getDefaultCellPaddingStyle(paddingSource, configured),
    ...source,
    ...rendererDefaults,
    ...configured,
    ...border
  };
}
