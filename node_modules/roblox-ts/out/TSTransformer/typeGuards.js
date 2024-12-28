"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlockLike = isBlockLike;
exports.isUnaryAssignmentOperator = isUnaryAssignmentOperator;
exports.isTemplateLiteralType = isTemplateLiteralType;
exports.isNamespace = isNamespace;
const typescript_1 = __importDefault(require("typescript"));
function isBlockLike(node) {
    return (node.kind === typescript_1.default.SyntaxKind.SourceFile ||
        node.kind === typescript_1.default.SyntaxKind.Block ||
        node.kind === typescript_1.default.SyntaxKind.ModuleBlock ||
        node.kind === typescript_1.default.SyntaxKind.CaseClause ||
        node.kind === typescript_1.default.SyntaxKind.DefaultClause);
}
function isUnaryAssignmentOperator(operator) {
    return operator === typescript_1.default.SyntaxKind.PlusPlusToken || operator === typescript_1.default.SyntaxKind.MinusMinusToken;
}
function isTemplateLiteralType(type) {
    return "texts" in type && "types" in type && !!(type.flags & typescript_1.default.TypeFlags.TemplateLiteral);
}
function isNamespace(node) {
    return typescript_1.default.isModuleDeclaration(node) && !!(node.flags & typescript_1.default.NodeFlags.Namespace);
}
//# sourceMappingURL=typeGuards.js.map