"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAncestorOf = isAncestorOf;
exports.skipDownwards = skipDownwards;
exports.skipUpwards = skipUpwards;
exports.getAncestor = getAncestor;
exports.getModuleAncestor = getModuleAncestor;
const typescript_1 = __importDefault(require("typescript"));
function isAncestorOf(ancestor, node) {
    do {
        if (ancestor === node) {
            return true;
        }
        node = node.parent;
    } while (node);
    return false;
}
function skipDownwards(node) {
    while (typescript_1.default.isNonNullExpression(node) ||
        typescript_1.default.isParenthesizedExpression(node) ||
        typescript_1.default.isAsExpression(node) ||
        typescript_1.default.isTypeAssertionExpression(node) ||
        typescript_1.default.isSatisfiesExpression(node)) {
        node = node.expression;
    }
    return node;
}
function skipUpwards(node) {
    let parent = node.parent;
    while (parent &&
        (typescript_1.default.isNonNullExpression(parent) ||
            typescript_1.default.isParenthesizedExpression(parent) ||
            typescript_1.default.isAsExpression(parent) ||
            typescript_1.default.isTypeAssertionExpression(parent) ||
            typescript_1.default.isSatisfiesExpression(parent))) {
        node = parent;
        parent = node.parent;
    }
    return node;
}
function getAncestor(node, check) {
    let current = node;
    while (current && !check(current)) {
        current = current.parent;
    }
    return current;
}
function isSourceFileOrModuleDeclaration(node) {
    return typescript_1.default.isSourceFile(node) || typescript_1.default.isModuleDeclaration(node);
}
function getModuleAncestor(node) {
    return getAncestor(node, isSourceFileOrModuleDeclaration);
}
//# sourceMappingURL=traversal.js.map