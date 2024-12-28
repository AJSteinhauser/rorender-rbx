"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderInterpolatedStringPart = void 0;
const LuauAST_1 = __importDefault(require("../../../LuauAST"));
function renderInterpolatedStringPart(state, node) {
    return (node.text
        .replace(/(\\u{[a-fA-F0-9]+})|([{}])/g, (_, unicodeEscape, brace) => unicodeEscape !== null && unicodeEscape !== void 0 ? unicodeEscape : "\\" + brace)
        .replace(/(\r\n?|\n)/g, "\\$1"));
}
exports.renderInterpolatedStringPart = renderInterpolatedStringPart;
//# sourceMappingURL=renderInterpolatedStringPart.js.map