import React, { PureComponent, Component } from "react";
import PropTypes from "prop-types";
import {
  Platform,
  StyleSheet,
  Dimensions,
  LayoutAnimation,
  Animated,
} from "react-native";
import makeWebshell, {
  dimensionsFeature,
  linkPressFeature,
  DimensionsObject,
  WebshellComponentOf,
} from "react-native-webshell";
import {
  cssRulesFromSpecs,
  defaultTableStylesSpecs,
} from "./css-rules";
import { TableStyleSpecs, HTMLTableProps } from "@src/types";
export { IGNORED_TAGS, TABLE_TAGS } from "./tags";

export { defaultTableStylesSpecs, cssRulesFromSpecs };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // See https://github.com/react-native-community/react-native-webview/issues/101
    overflow: "hidden",
  },
});

interface State {
  containerHeight: number;
  animatedHeight: Animated.Value;
}

const defaultInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

const DEFAULT_TRANSITION_DURATION = 120;

function animateNextFrames(duration?: number) {
  LayoutAnimation.configureNext({
    duration: duration || DEFAULT_TRANSITION_DURATION,
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
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
  thOddColor: PropTypes.string,
};

class __HTMLTable<
  WVP extends Record<string, any>
> extends PureComponent<HTMLTableProps<WVP>, State> {
  static defaultProps: Partial<Record<keyof HTMLTableProps<any>, any>> = {
    autoheight: true,
    useLayoutAnimations: false,
    transitionDuration: DEFAULT_TRANSITION_DURATION,
  };

  static displayName = 'HTMLTable';

  static propTypes: Record<keyof HTMLTableProps<any>, any> = {
    html: PropTypes.string.isRequired,
    numOfChars: PropTypes.number.isRequired,
    numOfColumns: PropTypes.number.isRequired,
    numOfRows: PropTypes.number.isRequired,
    WebViewComponent: PropTypes.func.isRequired,
    autoheight: PropTypes.bool,
    defaultHeight: PropTypes.number,
    maxHeight: PropTypes.number,
    onLinkPress: PropTypes.func,
    style: PropTypes.any,
    tableStyleSpecs: PropTypes.shape(tableStylePropTypeSpec),
    cssRules: PropTypes.string,
    webViewProps: PropTypes.object,
    useLayoutAnimations: PropTypes.bool,
    transitionDuration: PropTypes.number,
    sourceBaseUrl: PropTypes.string,
    renderersProps: PropTypes.any,
  };

  private oldContainerHeight: number = 0;
  private Webshell: WebshellComponentOf<
    any,
    [typeof linkPressFeature, typeof dimensionsFeature]
  >;

  constructor(props: HTMLTableProps<WVP>) {
    super(props);
    const state = {
      containerHeight: 0,
      animatedHeight: new Animated.Value(0),
    };
    this.state = state;
    this.oldContainerHeight = this.findHeight(this.props, this.state) || 0;
    this.Webshell = makeWebshell(
      props.WebViewComponent,
      linkPressFeature.assemble(),
      dimensionsFeature.assemble({ tagName: "table" })
    );
  }

  private buildHTML() {
    const { autoheight, tableStyleSpecs, cssRules, html } = this.props;
    const styleSpecs = tableStyleSpecs
      ? {
          ...defaultTableStylesSpecs,
          ...tableStyleSpecs,
        }
      : {
          ...defaultTableStylesSpecs,
          fitContainerHeight: !autoheight,
        };
    const tableCssStyle =
      typeof cssRules === "string" ? cssRules : cssRulesFromSpecs(styleSpecs);
    return `
      <!DOCTYPE html>
      <html>
      <head>
      <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=false">
      </head>
      <body>
        <style>
        ${tableCssStyle}
        </style>
        ${html}
      </body>
      </html>
      `;
  }

  private computeHeightHeuristic() {
    const { numOfChars, numOfRows } = this.props;
    const width = Dimensions.get("window").width;
    const charsPerLine = (30 * width) / 400;
    const lineHeight = 20;
    const approxNumOfLines = Math.floor(numOfChars / charsPerLine);
    return Math.max(approxNumOfLines, numOfRows) * lineHeight;
  }

  private findHeight(props: HTMLTableProps<WVP>, state: State) {
    const { containerHeight } = state;
    const { autoheight, defaultHeight, maxHeight } = props;
    const computedHeight = autoheight
      ? containerHeight
        ? containerHeight
        : this.computeHeightHeuristic()
      : defaultHeight;
    if (maxHeight) {
      return Math.min(maxHeight, computedHeight as number);
    }
    return computedHeight;
  }

  private onTableDimensions = ({ height: containerHeight }: DimensionsObject) => {
    if (typeof containerHeight === 'number' && !Number.isNaN(containerHeight)) {
      this.setState({ containerHeight })
    }
  };

  componentDidUpdate(oldProps: HTMLTableProps<WVP>, oldState: State) {
    const { autoheight, useLayoutAnimations, transitionDuration, WebViewComponent } = this.props;
    const shouldAnimate =
      oldState.containerHeight !== this.state.containerHeight && autoheight;
    if (shouldAnimate && !useLayoutAnimations) {
      this.oldContainerHeight = oldState.containerHeight;
      Animated.timing(this.state.animatedHeight, {
        toValue: 1,
        duration: transitionDuration,
        useNativeDriver: false,
      }).start();
    }
    if (shouldAnimate && useLayoutAnimations) {
      animateNextFrames(transitionDuration);
    }
    if (WebViewComponent !== oldProps.WebViewComponent && __DEV__) {
      throw new Error("HTMLTable: you cannot pass new WebViewComponent values");
    }
  }

  render() {
    const {
      autoheight,
      style,
      WebViewComponent,
      webViewProps: userWebViewProps,
      useLayoutAnimations,
      sourceBaseUrl,
      onLinkPress,
    } = this.props;
    const html = this.buildHTML();
    const source: any = {
      html,
    };
    if (sourceBaseUrl) {
      source.baseUrl = sourceBaseUrl;
    }
    const containerHeight = this.findHeight(this.props, this.state);
    const Webshell = this.Webshell;
    const containerStyle =
      autoheight && !useLayoutAnimations
        ? {
            height: this.state.animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [this.oldContainerHeight, containerHeight as number],
            }),
          }
        : {
            height:
              !containerHeight || Number.isNaN(containerHeight)
                ? undefined
                : containerHeight,
          };
    const webViewProps = {
      scalesPageToFit: Platform.select({ android: false, ios: undefined }),
      automaticallyAdjustContentInsets: false,
      scrollEnabled: true,
      contentInset: defaultInsets,
      ...userWebViewProps,
      style: [StyleSheet.absoluteFill, userWebViewProps?.style],
      source,
    };
    return (
      <Animated.View style={[containerStyle, styles.container, style]}>
        <Webshell
          onLinkPress={onLinkPress}
          onDimensions={this.onTableDimensions}
          webViewProps={webViewProps}
        />
      </Animated.View>
    );
  }
}

/**
 * @public
 */
export declare class HTMLTable<WVP> extends Component<HTMLTableProps<WVP>> {}

module.exports = {
  HTMLTable: __HTMLTable
}
