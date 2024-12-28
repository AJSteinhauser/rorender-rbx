"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformJsxAttributes = transformJsxAttributes;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const diagnostics_1 = require("../../../Shared/diagnostics");
const DiagnosticService_1 = require("../../classes/DiagnosticService");
const transformExpression_1 = require("../expressions/transformExpression");
const createTruthinessChecks_1 = require("../../util/createTruthinessChecks");
const pointer_1 = require("../../util/pointer");
const types_1 = require("../../util/types");
const typescript_1 = __importDefault(require("typescript"));
function createJsxAttributeLoop(state, attributesPtrValue, expression, tsExpression) {
    const definitelyObject = (0, types_1.isDefinitelyType)(state.getType(tsExpression), types_1.isObjectType);
    if (!definitelyObject) {
        expression = state.pushToVarIfComplex(expression, "attribute");
    }
    const keyId = luau_ast_1.default.tempId("k");
    const valueId = luau_ast_1.default.tempId("v");
    let statement = luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ForStatement, {
        ids: luau_ast_1.default.list.make(keyId, valueId),
        expression,
        statements: luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
            left: luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
                expression: attributesPtrValue,
                index: keyId,
            }),
            operator: "=",
            right: valueId,
        })),
    });
    if (!definitelyObject) {
        statement = luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.IfStatement, {
            condition: (0, createTruthinessChecks_1.createTruthinessChecks)(state, expression, tsExpression),
            statements: luau_ast_1.default.list.make(statement),
            elseBody: luau_ast_1.default.list.make(),
        });
    }
    return statement;
}
function transformJsxAttribute(state, attribute, attributesPtr) {
    let initializer = attribute.initializer;
    if (initializer && typescript_1.default.isJsxExpression(initializer)) {
        initializer = initializer.expression;
    }
    const [init, initPrereqs] = initializer
        ? state.capture(() => (0, transformExpression_1.transformExpression)(state, initializer))
        : [luau_ast_1.default.bool(true), luau_ast_1.default.list.make()];
    if (!luau_ast_1.default.list.isEmpty(initPrereqs)) {
        (0, pointer_1.disableMapInline)(state, attributesPtr);
        state.prereqList(initPrereqs);
    }
    const text = typescript_1.default.isIdentifier(attribute.name) ? attribute.name.text : typescript_1.default.getTextOfJsxNamespacedName(attribute.name);
    const name = luau_ast_1.default.string(text);
    (0, pointer_1.assignToMapPointer)(state, attributesPtr, name, init);
}
function transformJsxAttributes(state, attributes, attributesPtr) {
    for (const attribute of attributes.properties) {
        if (typescript_1.default.isJsxAttribute(attribute)) {
            transformJsxAttribute(state, attribute, attributesPtr);
        }
        else {
            const expType = state.typeChecker.getNonOptionalType(state.getType(attribute.expression));
            const symbol = (0, types_1.getFirstDefinedSymbol)(state, expType);
            if (symbol && state.services.macroManager.isMacroOnlyClass(symbol)) {
                DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noMacroObjectSpread(attribute));
            }
            const expression = (0, transformExpression_1.transformExpression)(state, attribute.expression);
            if (attribute === attributes.properties[0] && (0, types_1.isDefinitelyType)(expType, types_1.isObjectType)) {
                attributesPtr.value = state.pushToVar(luau_ast_1.default.call(luau_ast_1.default.globals.table.clone, [expression]), attributesPtr.name);
                state.prereq(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.CallStatement, {
                    expression: luau_ast_1.default.call(luau_ast_1.default.globals.setmetatable, [attributesPtr.value, luau_ast_1.default.nil()]),
                }));
                continue;
            }
            (0, pointer_1.disableMapInline)(state, attributesPtr);
            state.prereq(createJsxAttributeLoop(state, attributesPtr.value, expression, attribute.expression));
        }
    }
}
//# sourceMappingURL=transformJsxAttributes.js.map