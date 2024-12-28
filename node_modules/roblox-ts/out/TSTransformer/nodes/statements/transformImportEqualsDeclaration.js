"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformImportEqualsDeclaration = transformImportEqualsDeclaration;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const assert_1 = require("../../../Shared/util/assert");
const transformVariableStatement_1 = require("./transformVariableStatement");
const transformEntityName_1 = require("../transformEntityName");
const createImportExpression_1 = require("../../util/createImportExpression");
const isSymbolOfValue_1 = require("../../util/isSymbolOfValue");
const typescript_1 = __importDefault(require("typescript"));
function transformImportEqualsDeclaration(state, node) {
    const { moduleReference } = node;
    if (typescript_1.default.isExternalModuleReference(moduleReference)) {
        (0, assert_1.assert)(typescript_1.default.isStringLiteral(moduleReference.expression));
        const importExp = (0, createImportExpression_1.createImportExpression)(state, node.getSourceFile(), moduleReference.expression);
        const statements = luau_ast_1.default.list.make();
        const aliasSymbol = state.typeChecker.getSymbolAtLocation(node.name);
        (0, assert_1.assert)(aliasSymbol);
        if ((0, isSymbolOfValue_1.isSymbolOfValue)(typescript_1.default.skipAlias(aliasSymbol, state.typeChecker))) {
            luau_ast_1.default.list.pushList(statements, state.capturePrereqs(() => (0, transformVariableStatement_1.transformVariable)(state, node.name, importExp)));
        }
        if (state.compilerOptions.verbatimModuleSyntax &&
            luau_ast_1.default.list.isEmpty(statements) &&
            luau_ast_1.default.isCallExpression(importExp)) {
            luau_ast_1.default.list.push(statements, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.CallStatement, { expression: importExp }));
        }
        return statements;
    }
    else {
        return state.capturePrereqs(() => (0, transformVariableStatement_1.transformVariable)(state, node.name, (0, transformEntityName_1.transformEntityName)(state, moduleReference)));
    }
}
//# sourceMappingURL=transformImportEqualsDeclaration.js.map