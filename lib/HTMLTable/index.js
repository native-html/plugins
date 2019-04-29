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
const css_styles_1 = __importDefault(require("./css-styles"));
const react_native_1 = require("react-native");
class HTMLTable extends react_1.PureComponent {
    constructor() {
        super(...arguments);
        this.handleOnShouldStartLoadWithRequest = ({ url }) => {
            const { onPressLink } = this.props;
            onPressLink && onPressLink(url);
            return !url;
        };
    }
    render() {
        const { tableStyleSpecs: styleSpecs, cssRules, rawHtml, style, WebViewComponent } = this.props;
        const tableCssStyle = cssRules ? cssRules : css_styles_1.default(styleSpecs);
        const html = `
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
        const source = {
            html
        };
        const WebView = WebViewComponent;
        return (react_1.default.createElement(WebView, { scalesPageToFit: react_native_1.Platform.select({ android: false, ios: undefined }), automaticallyAdjustContentInsets: false, javaScriptEnabled: false, scrollEnabled: true, onShouldStartLoadWithRequest: this.handleOnShouldStartLoadWithRequest, style: style, contentInset: { top: 0, bottom: 0, left: 0, right: 0 }, source: source }));
    }
}
exports.default = HTMLTable;
