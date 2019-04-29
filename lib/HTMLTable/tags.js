"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const without_1 = __importDefault(require("ramda/es/without"));
const HTMLUtils_1 = require("react-native-render-html/src/HTMLUtils");
exports.TABLE_TAGS = ['table', 'caption', 'col', 'colgroup', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'];
exports.IGNORED_TAGS = without_1.default(['table', 'caption', 'col', 'colgroup', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'], HTMLUtils_1.IGNORED_TAGS);
