"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_native_1 = require("react-native");
const css_styles_1 = __importDefault(require("./css-styles"));
const script_1 = __importDefault(require("./script"));
var tags_1 = require("./tags");
exports.IGNORED_TAGS = tags_1.IGNORED_TAGS;
exports.TABLE_TAGS = tags_1.TABLE_TAGS;
const styles = react_native_1.StyleSheet.create({
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
function animateNextFrames() {
    react_native_1.LayoutAnimation.configureNext({
        duration: 300,
        create: {
            type: react_native_1.LayoutAnimation.Types.easeInEaseOut,
            property: react_native_1.LayoutAnimation.Properties.opacity
        },
        update: {
            type: react_native_1.LayoutAnimation.Types.easeInEaseOut
        }
    });
}
const DEFAULT_CONTAINER_HEIGHT = Math.max(react_native_1.Dimensions.get('window').height, react_native_1.Dimensions.get('window').width) / 2;
class HTMLTable extends react_1.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            containerHeight: 0
        };
        this.handleOnMessage = ({ nativeEvent }) => {
            const { type, content } = JSON.parse(nativeEvent.data);
            if (type === 'heightUpdate') {
                const containerHeight = content;
                if (typeof containerHeight === 'number' && !Number.isNaN(containerHeight)) {
                    this.setState({ containerHeight });
                }
            }
            if (type === 'navigateEvent') {
                const { onLinkPress } = this.props;
                const url = content;
                onLinkPress && onLinkPress(url);
            }
        };
    }
    buildHTML() {
        const { tableStyleSpecs: styleSpecs, cssRules, rawHtml } = this.props;
        const tableCssStyle = cssRules ? cssRules : css_styles_1.default(styleSpecs);
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
        ${rawHtml}
      </body>
      </html>
      `;
    }
    findHeight() {
        const { containerHeight } = this.state;
        const { autoheight, defaultHeight, maxHeight } = this.props;
        const computedHeight = autoheight ?
            containerHeight ? containerHeight : DEFAULT_CONTAINER_HEIGHT :
            defaultHeight;
        if (maxHeight) {
            return Math.min(maxHeight, computedHeight);
        }
        return computedHeight;
    }
    componentWillUpdate(_nextProps, nextState) {
        if (nextState.containerHeight !== this.state.containerHeight) {
            animateNextFrames();
        }
    }
    render() {
        const { style, WebViewComponent, webViewProps } = this.props;
        const html = this.buildHTML();
        const source = {
            html
        };
        const WebView = WebViewComponent;
        const containerStyle = {
            height: this.findHeight()
        };
        return (react_1.default.createElement(react_native_1.View, { style: [containerStyle, styles.container, style] },
            react_1.default.createElement(WebView, Object.assign({ scalesPageToFit: react_native_1.Platform.select({ android: false, ios: undefined }), automaticallyAdjustContentInsets: false, scrollEnabled: true, style: react_native_1.StyleSheet.absoluteFill, contentInset: defaultInsets }, webViewProps, { injectedJavaScript: script_1.default, javaScriptEnabled: true, onMessage: this.handleOnMessage, source: source }))));
    }
}
HTMLTable.defaultProps = {
    autoheight: true
};
HTMLTable.propTypes = {
    rawHtml: prop_types_1.default.string.isRequired,
    WebViewComponent: prop_types_1.default.func.isRequired,
    autoheight: prop_types_1.default.bool,
    defaultHeight: prop_types_1.default.number,
    maxHeight: prop_types_1.default.number,
    onLinkPress: prop_types_1.default.func,
    style: prop_types_1.default.any,
    tableStyleSpecs: prop_types_1.default.shape({
        linkColor: prop_types_1.default.string.isRequired,
        fontFamily: prop_types_1.default.string.isRequired,
        tdBorderColor: prop_types_1.default.string.isRequired,
        thBorderColor: prop_types_1.default.string.isRequired,
        thBackground: prop_types_1.default.string.isRequired,
        thColor: prop_types_1.default.string.isRequired,
        trOddBackground: prop_types_1.default.string.isRequired,
        trOddColor: prop_types_1.default.string.isRequired,
        trEvenBackground: prop_types_1.default.string.isRequired,
        trEvenColor: prop_types_1.default.string.isRequired
    }),
    cssRules: prop_types_1.default.string,
    webViewProps: prop_types_1.default.object
};
exports.default = HTMLTable;
