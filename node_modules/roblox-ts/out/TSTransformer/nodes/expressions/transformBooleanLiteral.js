"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformTrueKeyword = transformTrueKeyword;
exports.transformFalseKeyword = transformFalseKeyword;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
function transformTrueKeyword() {
    return luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.TrueLiteral, {});
}
function transformFalseKeyword() {
    return luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.FalseLiteral, {});
}
//# sourceMappingURL=transformBooleanLiteral.js.map