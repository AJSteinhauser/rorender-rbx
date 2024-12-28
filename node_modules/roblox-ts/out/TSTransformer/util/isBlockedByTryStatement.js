"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReturnBlockedByTryStatement = isReturnBlockedByTryStatement;
exports.isBreakBlockedByTryStatement = isBreakBlockedByTryStatement;
const typescript_1 = __importDefault(require("typescript"));
function isReturnBlockedByTryStatement(node) {
    const ancestor = typescript_1.default.findAncestor(node, ancestor => typescript_1.default.isTryStatement(ancestor) || typescript_1.default.isFunctionLikeDeclaration(ancestor));
    return ancestor !== undefined && typescript_1.default.isTryStatement(ancestor);
}
function isBreakBlockedByTryStatement(node) {
    const ancestor = typescript_1.default.findAncestor(node, ancestor => typescript_1.default.isTryStatement(ancestor) || typescript_1.default.isIterationStatement(ancestor, false) || typescript_1.default.isSwitchStatement(ancestor));
    return ancestor !== undefined && typescript_1.default.isTryStatement(ancestor);
}
//# sourceMappingURL=isBlockedByTryStatement.js.map