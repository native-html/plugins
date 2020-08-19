import React, { PureComponent, Component, ComponentType } from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  StyleSheet,
  Dimensions,
  LayoutAnimation,
  Animated
} from 'react-native';
import makeWebshell, {
  elementDimensionsFeature,
  linkPressFeature,
  ElementDimensionsObject,
  WebshellComponentOf,
  MinimalWebViewProps,
  AssembledFeatureOf
} from '@formidable-webview/webshell';
import { cssRulesFromSpecs, defaultTableStylesSpecs } from './css-rules';
import {
  TableStyleSpecs,
  HTMLTableProps,
  TableHeightState,
  HTMLTableStats
} from './types';
export { IGNORED_TAGS, TABLE_TAGS } from './tags';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // See https://github.com/react-native-community/react-native-webview/issues/101
    overflow: 'hidden'
  }
});

interface State {
  contentHeight: number | null;
  animatedHeight: Animated.Value;
}

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
  borderWidthPx: PropTypes.number,
  cellPaddingEm: PropTypes.number,
  fitContainerWidth: PropTypes.bool,
  fitContainerHeight: PropTypes.bool,
  selectableText: PropTypes.bool,
  thEvenBackground: PropTypes.string,
  thEvenColor: PropTypes.string,
  thOddBackground: PropTypes.string,
  thOddColor: PropTypes.string
};

type TableFeatures = [typeof linkPressFeature, typeof elementDimensionsFeature];

function findHeight({
  computeContainerHeight,
  computeHeightHeuristic,
  contentHeight,
  stats
}: {
  computeContainerHeight: (state: TableHeightState) => number | null;
  computeHeightHeuristic: (tableStats: HTMLTableStats) => number;
  contentHeight: number | null;
  stats: HTMLTableStats;
}) {
  if (typeof contentHeight === 'number') {
    return computeContainerHeight({
      type: 'determinated',
      scrollableHeight: contentHeight
    });
  }
  return computeContainerHeight({
    type: 'undeterminated',
    heuristicHeight: computeHeightHeuristic(stats)
  });
}

export function defaultComputeHeightHeuristic(tableStats: HTMLTableStats) {
  const { numOfChars, numOfRows } = tableStats;
  const width = Dimensions.get('window').width;
  const charsPerLine = (30 * width) / 400;
  const lineHeight = 20;
  const approxNumOfLines = Math.floor(numOfChars / charsPerLine);
  return Math.max(approxNumOfLines, numOfRows) * lineHeight;
}

export function defaultComputeContainerHeight(state: TableHeightState) {
  if (state.type === 'undeterminated') {
    return state.heuristicHeight;
  }
  return state.scrollableHeight;
}

class __HTMLTable<WVP extends MinimalWebViewProps> extends PureComponent<
  HTMLTableProps<WVP>,
  State
> {
  static defaultProps = {
    animationDuration: DEFAULT_TRANSITION_DURATION,
    animationType: 'animated',
    computeHeightHeuristic: defaultComputeHeightHeuristic,
    computeContainerHeight: defaultComputeContainerHeight
  };

  static displayName = 'HTMLTable';

  static propTypes: Record<keyof HTMLTableProps<any>, any> = {
    animationDuration: PropTypes.number.isRequired,
    animationType: PropTypes.oneOf(['none', 'animated', 'layout']),
    computeContainerHeight: PropTypes.func.isRequired,
    computeHeightHeuristic: PropTypes.func.isRequired,
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

  private oldContainerHeight: number | null = null;
  private Webshell: WebshellComponentOf<ComponentType<any>, TableFeatures>;

  constructor(props: Required<HTMLTableProps<WVP>>) {
    super(props);
    const state = {
      contentHeight: null,
      animatedHeight: new Animated.Value(0)
    };
    this.state = state;
    this.oldContainerHeight = null;
    this.Webshell = makeWebshell<
      AssembledFeatureOf<TableFeatures[keyof TableFeatures]>[],
      ComponentType<any>
    >(
      props.WebView,
      linkPressFeature.assemble(),
      elementDimensionsFeature.assemble({ tagName: 'table' })
    );
  }

  private buildHTML() {
    const { tableStyleSpecs, cssRules, html } = this.props;
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
  }

  private onTableDimensions = ({
    height: contentHeight
  }: ElementDimensionsObject) => {
    if (typeof contentHeight === 'number' && !Number.isNaN(contentHeight)) {
      this.setState({ contentHeight });
    }
  };

  componentDidUpdate(oldProps: HTMLTableProps<WVP>, oldState: State) {
    const { animationDuration, WebView, animationType } = this
      .props as Required<HTMLTableProps<WVP>>;
    const shouldAnimate =
      oldState.contentHeight !== this.state.contentHeight &&
      animationType !== 'none';
    if (shouldAnimate && animationType === 'animated') {
      this.oldContainerHeight = oldState.contentHeight || 0;
      Animated.timing(this.state.animatedHeight, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: false
      }).start();
    }
    if (shouldAnimate && animationType === 'layout') {
      animateNextFrames(animationDuration);
    }
    if (WebView !== oldProps.WebView && __DEV__) {
      throw new Error('HTMLTable: you cannot change WebView prop');
    }
  }

  render() {
    const {
      computeContainerHeight,
      computeHeightHeuristic,
      style,
      sourceBaseUrl,
      onLinkPress,
      animationType,
      webViewProps: userWebViewProps
    } = this.props as Required<HTMLTableProps<any>>;
    const html = this.buildHTML(); // TODO memoize
    const source: any = {
      html
    };
    if (sourceBaseUrl) {
      source.baseUrl = sourceBaseUrl;
    }
    const containerHeight = findHeight({
      computeContainerHeight,
      computeHeightHeuristic,
      contentHeight: this.state.contentHeight,
      stats: this.props
    });
    const Webshell = this.Webshell;
    const containerStyle =
      animationType === 'animated' && containerHeight !== null
        ? {
            height: this.state.animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [
                this.oldContainerHeight === null
                  ? containerHeight
                  : this.oldContainerHeight,
                containerHeight
              ]
            })
          }
        : {
            height:
              !containerHeight || Number.isNaN(containerHeight)
                ? undefined
                : containerHeight
          };
    const webViewProps = {
      scalesPageToFit: Platform.select({ android: false, ios: undefined }),
      automaticallyAdjustContentInsets: false,
      scrollEnabled: true,
      contentInset: defaultInsets,
      ...userWebViewProps,
      style: [StyleSheet.absoluteFill, (userWebViewProps as any)?.style],
      source
    };
    return (
      <Animated.View
        testID="html-table-container"
        style={[containerStyle, styles.container, style]}>
        <Webshell
          onDOMLinkPress={onLinkPress}
          onDOMElementDimensions={this.onTableDimensions}
          {...(webViewProps as MinimalWebViewProps)}
        />
      </Animated.View>
    );
  }
}

/**
 * A component capable of rendering a html string which root tag is a table
 * tag. This component should not be used directly, except with custom
 * renderers.
 *
 * @public
 */
export declare class HTMLTable<WVP> extends Component<HTMLTableProps<WVP>> {}

module.exports = {
  HTMLTable: __HTMLTable
};
