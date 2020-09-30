import React, { useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  StyleSheet,
  Dimensions,
  LayoutAnimation,
  Animated
} from 'react-native';
import makeWebshell, {
  useAutoheight,
  HandleHTMLDimensionsFeature,
  HandleLinkPressFeature,
  MinimalWebViewProps
} from '@formidable-webview/webshell';
import { cssRulesFromSpecs, defaultTableStylesSpecs } from './css-rules';
import {
  TableStyleSpecs,
  HTMLTableProps,
  TableContentHeightState,
  HTMLTableStats
} from './types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // See https://github.com/react-native-community/react-native-webview/issues/101
    overflow: 'hidden'
  }
});

const defaultInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
};

const DEFAULT_TRANSITION_DURATION = 120;

function animateNextFrames(duration?: number) {
  LayoutAnimation.configureNext({
    duration: duration || DEFAULT_TRANSITION_DURATION,
    update: {
      type: LayoutAnimation.Types.easeInEaseOut
    }
  });
}

const tableStylePropTypeSpec: Record<keyof TableStyleSpecs, any> = {
  linkColor: PropTypes.string,
  fontFamily: PropTypes.string,
  fontSizePx: PropTypes.number,
  tdBorderColor: PropTypes.string,
  thBorderColor: PropTypes.string,
  trOddBackground: PropTypes.string,
  trOddColor: PropTypes.string,
  trEvenBackground: PropTypes.string,
  trEvenColor: PropTypes.string,
  rowsBorderWidthPx: PropTypes.number,
  columnsBorderWidthPx: PropTypes.number,
  outerBorderColor: PropTypes.string,
  outerBorderWidthPx: PropTypes.number,
  cellPaddingEm: PropTypes.number,
  fitContainerWidth: PropTypes.bool,
  fitContainerHeight: PropTypes.bool,
  selectableText: PropTypes.bool,
  thEvenBackground: PropTypes.string,
  thEvenColor: PropTypes.string,
  thOddBackground: PropTypes.string,
  thOddColor: PropTypes.string
};

function findHeight({
  computeContainerHeight,
  computeHeuristicContentHeight,
  contentHeight,
  ...stats
}: {
  computeContainerHeight: (state: TableContentHeightState) => number | null;
  computeHeuristicContentHeight: (tableStats: HTMLTableStats) => number;
  contentHeight: number | null;
} & HTMLTableStats) {
  if (typeof contentHeight === 'number') {
    return computeContainerHeight({
      type: 'accurate',
      contentHeight: contentHeight
    });
  }
  return computeContainerHeight({
    type: 'heuristic',
    contentHeight: computeHeuristicContentHeight(stats)
  });
}

function defaultComputeHeuristicContentHeight(tableStats: HTMLTableStats) {
  const { numOfChars, numOfRows } = tableStats;
  const width = Dimensions.get('window').width;
  const charsPerLine = (30 * width) / 400;
  const lineHeight = 20;
  const approxNumOfLines = Math.floor(numOfChars / charsPerLine);
  return Math.max(approxNumOfLines, numOfRows) * lineHeight;
}

function defaultComputeContainerHeight(state: TableContentHeightState) {
  return state.contentHeight;
}

function useAnimatedAutoheight<WVP extends MinimalWebViewProps>({
  computeContainerHeight,
  computeHeuristicContentHeight,
  animationType,
  animationDuration,
  webViewProps,
  numOfChars,
  numOfColumns,
  numOfRows
}: Pick<
  HTMLTableProps<any>,
  | 'animationType'
  | 'animationDuration'
  | 'numOfChars'
  | 'numOfColumns'
  | 'numOfRows'
> & { webViewProps: any } & Required<
    Pick<
      HTMLTableProps<any>,
      'computeContainerHeight' | 'computeHeuristicContentHeight'
    >
  >) {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const { autoheightWebshellProps, contentSize, syncState } = useAutoheight<
    WVP
  >({
    webshellProps: webViewProps as any,
    reinitHeightOnViewportWidthChange: false
  });
  const containerHeight = useMemo(
    () =>
      findHeight({
        computeContainerHeight,
        computeHeuristicContentHeight,
        contentHeight: syncState === 'synced' ? contentSize.height || 0 : null,
        numOfChars,
        numOfColumns,
        numOfRows
      }),
    [
      computeContainerHeight,
      computeHeuristicContentHeight,
      contentSize.height,
      syncState,
      numOfChars,
      numOfColumns,
      numOfRows
    ]
  );
  const oldContainerHeightRef = useRef<number | null>(containerHeight);
  const containerStyle = useMemo(
    () =>
      animationType === 'animated' && containerHeight !== null
        ? {
            height: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [
                oldContainerHeightRef.current || containerHeight,
                containerHeight
              ]
            })
          }
        : {
            height:
              !containerHeight || Number.isNaN(containerHeight)
                ? undefined
                : containerHeight
          },
    [animatedHeight, animationType, containerHeight]
  );
  useLayoutEffect(() => {
    if (oldContainerHeightRef.current !== containerHeight) {
      oldContainerHeightRef.current = containerHeight;
      if (animationType === 'animated') {
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: false
        }).start();
      } else if (animationType === 'layout') {
        animateNextFrames(animationDuration);
      }
    }
  }, [containerHeight, animationDuration, animationType, animatedHeight]);
  return {
    containerStyle,
    autoheightWebshellProps
  };
}

function useSource({
  tableStyleSpecs,
  cssRules,
  sourceBaseUrl,
  html
}: Pick<
  HTMLTableProps<any>,
  'html' | 'cssRules' | 'tableStyleSpecs' | 'sourceBaseUrl'
>) {
  const injectedHtml = useMemo(() => {
    const styleSpecs = tableStyleSpecs
      ? {
          ...defaultTableStylesSpecs,
          ...tableStyleSpecs
        }
      : defaultTableStylesSpecs;
    const tableCssStyle =
      typeof cssRules === 'string' ? cssRules : cssRulesFromSpecs(styleSpecs);
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=false">
    <title>Table</title>
    <style>${tableCssStyle}</style>
  </head>
  <body>${html}</body>
  </html>
        `;
  }, [tableStyleSpecs, cssRules, html]);
  return useMemo(
    () => ({
      html: injectedHtml,
      baseUrl: sourceBaseUrl ?? undefined
    }),
    [injectedHtml, sourceBaseUrl]
  );
}

/**
 * A component capable of rendering a html string which root tag is a table
 * tag. This component should not be used directly, except with custom
 * renderers.
 *
 * @public
 */
export function HTMLTable({
  WebView,
  tableStyleSpecs,
  cssRules,
  html,
  sourceBaseUrl,
  animationType,
  computeHeuristicContentHeight = defaultComputeHeuristicContentHeight,
  computeContainerHeight = defaultComputeContainerHeight,
  webViewProps: userWebViewProps,
  style,
  onLinkPress,
  animationDuration,
  renderersProps,
  ...stats
}: HTMLTableProps<MinimalWebViewProps>) {
  const Webshell = useMemo(
    () =>
      makeWebshell(
        WebView,
        new HandleLinkPressFeature(),
        new HandleHTMLDimensionsFeature()
      ),
    [WebView]
  );
  const onDOMLinkPress = useCallback(
    (t) => {
      onLinkPress?.(t.uri);
    },
    [onLinkPress]
  );
  const { autoheightWebshellProps, containerStyle } = useAnimatedAutoheight({
    ...stats,
    animationDuration,
    animationType,
    computeContainerHeight,
    computeHeuristicContentHeight,
    webViewProps: {
      scalesPageToFit: Platform.select({ android: false, ios: undefined }),
      automaticallyAdjustContentInsets: false,
      scrollEnabled: true,
      contentInset: defaultInsets,
      ...userWebViewProps,
      source: useSource({
        html,
        cssRules,
        sourceBaseUrl,
        tableStyleSpecs
      })
    }
  });
  return (
    <Animated.View
      testID="html-table-container"
      style={[containerStyle, styles.container, style]}>
      {
        <Webshell
          onDOMLinkPress={onDOMLinkPress}
          {...autoheightWebshellProps}
          webshellDebug
        />
      }
    </Animated.View>
  );
}

const propTypes: Record<keyof HTMLTableProps<any>, any> = {
  animationDuration: PropTypes.number.isRequired,
  animationType: PropTypes.oneOf(['none', 'animated', 'layout']),
  computeContainerHeight: PropTypes.func.isRequired,
  computeHeuristicContentHeight: PropTypes.func.isRequired,
  html: PropTypes.string.isRequired,
  numOfChars: PropTypes.number.isRequired,
  numOfColumns: PropTypes.number.isRequired,
  numOfRows: PropTypes.number.isRequired,
  WebView: PropTypes.func.isRequired,
  onLinkPress: PropTypes.func,
  style: PropTypes.any,
  tableStyleSpecs: PropTypes.shape(tableStylePropTypeSpec),
  cssRules: PropTypes.string,
  webViewProps: PropTypes.object,
  sourceBaseUrl: PropTypes.string,
  renderersProps: PropTypes.any
};

const defaultProps = {
  animationDuration: DEFAULT_TRANSITION_DURATION,
  animationType: 'animated',
  computeHeuristicContentHeight: defaultComputeHeuristicContentHeight,
  computeContainerHeight: defaultComputeContainerHeight
};

Object.defineProperty(HTMLTable, 'propTypes', {
  value: propTypes
});

Object.defineProperty(HTMLTable, 'defaultProps', {
  value: defaultProps
});
