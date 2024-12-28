"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformImplicitClassConstructor = transformImplicitClassConstructor;
exports.transformClassConstructor = transformClassConstructor;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const diagnostics_1 = require("../../../Shared/diagnostics");
const DiagnosticService_1 = require("../../classes/DiagnosticService");
const transformExpression_1 = require("../expressions/transformExpression");
const transformIdentifier_1 = require("../expressions/transformIdentifier");
const transformParameters_1 = require("../transformParameters");
const transformPropertyName_1 = require("../transformPropertyName");
const transformStatementList_1 = require("../transformStatementList");
const getExtendsNode_1 = require("../../util/getExtendsNode");
const getStatements_1 = require("../../util/getStatements");
const typescript_1 = __importDefault(require("typescript"));
const CONSTRUCTOR = "constructor";
function transformPropertyInitializers(state, node) {
    const statements = luau_ast_1.default.list.make();
    for (const member of node.members) {
        if (!typescript_1.default.isPropertyDeclaration(member))
            continue;
        if (typescript_1.default.hasStaticModifier(member))
            continue;
        const name = member.name;
        if (typescript_1.default.isPrivateIdentifier(name)) {
            DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noPrivateIdentifier(node));
            continue;
        }
        const initializer = member.initializer;
        if (!initializer)
            continue;
        const [index, indexPrereqs] = state.capture(() => (0, transformPropertyName_1.transformPropertyName)(state, name));
        luau_ast_1.default.list.pushList(statements, indexPrereqs);
        const [right, rightPrereqs] = state.capture(() => (0, transformExpression_1.transformExpression)(state, initializer));
        luau_ast_1.default.list.pushList(statements, rightPrereqs);
        luau_ast_1.default.list.push(statements, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
            left: luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
                expression: luau_ast_1.default.globals.self,
                index,
            }),
            operator: "=",
            right,
        }));
    }
    return statements;
}
function transformImplicitClassConstructor(state, node, name) {
    const statements = luau_ast_1.default.list.make();
    let hasDotDotDot = false;
    if ((0, getExtendsNode_1.getExtendsNode)(node)) {
        hasDotDotDot = true;
        luau_ast_1.default.list.push(statements, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.CallStatement, {
            expression: luau_ast_1.default.call(luau_ast_1.default.property(luau_ast_1.default.globals.super, CONSTRUCTOR), [
                luau_ast_1.default.globals.self,
                luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.VarArgsLiteral, {}),
            ]),
        }));
    }
    luau_ast_1.default.list.pushList(statements, transformPropertyInitializers(state, node));
    return luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.MethodDeclaration, {
        expression: name,
        name: CONSTRUCTOR,
        statements,
        parameters: luau_ast_1.default.list.make(),
        hasDotDotDot,
    }));
}
function transformClassConstructor(state, node, name) {
    const { statements, parameters, hasDotDotDot } = (0, transformParameters_1.transformParameters)(state, node);
    const bodyStatements = (0, getStatements_1.getStatements)(node.body);
    const superIndex = bodyStatements.findIndex(v => typescript_1.default.isExpressionStatement(v) && typescript_1.default.isSuperCall(v.expression));
    luau_ast_1.default.list.pushList(statements, (0, transformStatementList_1.transformStatementList)(state, node.body, bodyStatements.slice(0, superIndex + 1)));
    for (const parameter of node.parameters) {
        if (typescript_1.default.isParameterPropertyDeclaration(parameter, parameter.parent)) {
            const paramId = (0, transformIdentifier_1.transformIdentifierDefined)(state, parameter.name);
            luau_ast_1.default.list.push(statements, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
                left: luau_ast_1.default.property(luau_ast_1.default.globals.self, paramId.name),
                operator: "=",
                right: paramId,
            }));
        }
    }
    luau_ast_1.default.list.pushList(statements, transformPropertyInitializers(state, node.parent));
    luau_ast_1.default.list.pushList(statements, (0, transformStatementList_1.transformStatementList)(state, node.body, bodyStatements.slice(superIndex + 1)));
    return luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.MethodDeclaration, {
        expression: name,
        name: CONSTRUCTOR,
        statements,
        parameters,
        hasDotDotDot,
    }));
}
//# sourceMappingURL=transformClassConstructor.js.map