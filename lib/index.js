"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const make_table_renderer_1 = __importDefault(require("./make-table-renderer"));
exports.makeTableRenderer = make_table_renderer_1.default;
const alter_node_1 = __importStar(require("./alter-node"));
exports.alterNode = alter_node_1.default;
exports.domToHTML = alter_node_1.domToHTML;
const HTMLTable_1 = __importDefault(require("./HTMLTable"));
exports.HTMLTable = HTMLTable_1.default;
