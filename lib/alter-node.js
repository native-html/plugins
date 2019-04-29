"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const forEachObjIndexed_1 = __importDefault(require("ramda/es/forEachObjIndexed"));
const stringify_entities_1 = __importDefault(require("stringify-entities"));
function renderOpeningTag(tag, attributes) {
    const strAttributes = [];
    forEachObjIndexed_1.default((attrVal, attrKey) => {
        strAttributes.push(`${attrKey}="${stringify_entities_1.default(attrVal)}"`);
    })(attributes);
    return `<${tag}${strAttributes.length ? ' ' : ''}${strAttributes.join(' ')}>`;
}
function domToHTML(root) {
    if (root.type === 'tag') {
        const strChildren = root.children.reduce((prev, curr) => `${prev}${domToHTML(curr)}`, '');
        return `${renderOpeningTag(root.name, root.attribs)}${strChildren}</${root.name}>`;
    }
    if (root.type === 'text') {
        return stringify_entities_1.default(root.data);
    }
    return '';
}
exports.domToHTML = domToHTML;
function alterNode(node) {
    if (node.type === 'tag' && node.name === 'table') {
        node.attribs.cellspacing = '0';
        node.attribs.rawHtml = domToHTML(node);
    }
}
exports.default = alterNode;
