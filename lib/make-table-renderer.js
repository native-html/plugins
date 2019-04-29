"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const HTMLTable_1 = __importDefault(require("./HTMLTable"));
function makeTableRenderer(tableConfig) {
    return (attribs, _children, _css, { key, onLinkPress }) => {
        const handleOnLinkPress = (url) => onLinkPress && onLinkPress({}, url, {});
        return react_1.default.createElement(HTMLTable_1.default, Object.assign({ key: key }, tableConfig, { rawHtml: attribs.rawHtml, onLinkPress: handleOnLinkPress }));
    };
}
exports.default = makeTableRenderer;
