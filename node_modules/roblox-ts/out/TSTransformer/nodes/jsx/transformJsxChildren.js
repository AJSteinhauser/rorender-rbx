"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformJsxChildren = transformJsxChildren;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const diagnostics_1 = require("../../../Shared/diagnostics");
const findLastIndex_1 = require("../../../Shared/util/findLastIndex");
const DiagnosticService_1 = require("../../classes/DiagnosticService");
const transformExpression_1 = require("../expressions/transformExpression");
const ensureTransformOrder_1 = require("../../util/ensureTransformOrder");
const fixupWhitespaceAndDecodeEntities_1 = require("../../util/fixupWhitespaceAndDecodeEntities");
const typescript_1 = __importDefault(require("typescript"));
function transformJsxChildren(state, children) {
    const lastJsxChildIndex = (0, findLastIndex_1.findLastIndex)(children, child => !typescript_1.default.isJsxText(child) || !child.containsOnlyTriviaWhiteSpaces);
    for (let i = 0; i < lastJsxChildIndex; i++) {
        const child = children[i];
        if (typescript_1.default.isJsxExpression(child) && child.dotDotDotToken) {
            DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noPrecedingJsxSpreadElement(child));
        }
    }
    return (0, ensureTransformOrder_1.ensureTransformOrder)(state, children
        .filter(v => !typescript_1.default.isJsxText(v) || !v.containsOnlyTriviaWhiteSpaces)
        .filter(v => !typescript_1.default.isJsxExpression(v) || v.expression !== undefined), (state, node) => {
        var _a;
        if (typescript_1.default.isJsxText(node)) {
            const text = (_a = (0, fixupWhitespaceAndDecodeEntities_1.fixupWhitespaceAndDecodeEntities)(node.text)) !== null && _a !== void 0 ? _a : "";
            return luau_ast_1.default.string(text.replace(/\\/g, "\\\\"));
        }
        return (0, transformExpression_1.transformExpression)(state, node);
    });
}
//# sourceMappingURL=transformJsxChildren.js.map