"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformCallExpressionInner = transformCallExpressionInner;
exports.transformPropertyCallExpressionInner = transformPropertyCallExpressionInner;
exports.transformElementCallExpressionInner = transformElementCallExpressionInner;
exports.transformCallExpression = transformCallExpression;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const diagnostics_1 = require("../../../Shared/diagnostics");
const assert_1 = require("../../../Shared/util/assert");
const DiagnosticService_1 = require("../../classes/DiagnosticService");
const transformExpression_1 = require("./transformExpression");
const transformImportExpression_1 = require("./transformImportExpression");
const transformOptionalChain_1 = require("../transformOptionalChain");
const addOneIfArrayType_1 = require("../../util/addOneIfArrayType");
const convertToIndexableExpression_1 = require("../../util/convertToIndexableExpression");
const ensureTransformOrder_1 = require("../../util/ensureTransformOrder");
const expressionMightMutate_1 = require("../../util/expressionMightMutate");
const isMethod_1 = require("../../util/isMethod");
const types_1 = require("../../util/types");
const validateNotAny_1 = require("../../util/validateNotAny");
const valueToIdStr_1 = require("../../util/valueToIdStr");
const wrapReturnIfLuaTuple_1 = require("../../util/wrapReturnIfLuaTuple");
const typescript_1 = __importDefault(require("typescript"));
function runCallMacro(macro, state, node, expression, nodeArguments) {
    let args;
    const prereqs = state.capturePrereqs(() => {
        args = (0, ensureTransformOrder_1.ensureTransformOrder)(state, nodeArguments);
        const lastArg = nodeArguments[nodeArguments.length - 1];
        if (lastArg && typescript_1.default.isSpreadElement(lastArg)) {
            const signature = state.typeChecker.getSignaturesOfType(state.getType(node.expression), typescript_1.default.SignatureKind.Call)[0];
            const lastParameter = signature.parameters[signature.parameters.length - 1].valueDeclaration;
            if (lastParameter && typescript_1.default.isParameter(lastParameter) && lastParameter.dotDotDotToken) {
                DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noVarArgsMacroSpread(lastArg));
                return;
            }
            const tupleArgType = state.getType(lastArg.expression);
            (0, assert_1.assert)(state.typeChecker.isTupleType(tupleArgType));
            const argumentCount = tupleArgType.target.elementFlags.length;
            const spread = args.pop();
            const tempIds = luau_ast_1.default.list.make();
            for (let i = args.length; i < argumentCount; i++) {
                const tempId = luau_ast_1.default.tempId(`spread${i}`);
                args.push(tempId);
                luau_ast_1.default.list.push(tempIds, tempId);
            }
            state.prereq(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.VariableDeclaration, {
                left: tempIds,
                right: spread,
            }));
        }
        for (let i = 0; i < args.length; i++) {
            if ((0, expressionMightMutate_1.expressionMightMutate)(state, args[i], nodeArguments[i])) {
                args[i] = state.pushToVar(args[i], (0, valueToIdStr_1.valueToIdStr)(args[i]) || `arg${i}`);
            }
        }
    });
    let nodeExpression = node.expression;
    if (typescript_1.default.isPropertyAccessExpression(nodeExpression) || typescript_1.default.isElementAccessExpression(nodeExpression)) {
        nodeExpression = nodeExpression.expression;
    }
    if (!luau_ast_1.default.list.isEmpty(prereqs) && (0, expressionMightMutate_1.expressionMightMutate)(state, expression, nodeExpression)) {
        expression = state.pushToVar(expression, (0, valueToIdStr_1.valueToIdStr)(expression) || "exp");
    }
    state.prereqList(prereqs);
    return (0, wrapReturnIfLuaTuple_1.wrapReturnIfLuaTuple)(state, node, macro(state, node, expression, args));
}
function fixVoidArgumentsForRobloxFunctions(state, type, args, nodeArguments) {
    if ((0, types_1.isPossiblyType)(type, (0, types_1.isRobloxType)(state))) {
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            const nodeArg = nodeArguments[i];
            if (typescript_1.default.isCallExpression(nodeArg) && (0, types_1.isPossiblyType)(state.getType(nodeArg), types_1.isUndefinedType)) {
                args[i] = luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ParenthesizedExpression, {
                    expression: arg,
                });
            }
        }
    }
}
function transformCallExpressionInner(state, node, expression, nodeArguments) {
    if (typescript_1.default.isImportCall(node)) {
        return (0, transformImportExpression_1.transformImportExpression)(state, node);
    }
    (0, validateNotAny_1.validateNotAnyType)(state, node.expression);
    if (typescript_1.default.isSuperCall(node)) {
        return luau_ast_1.default.call(luau_ast_1.default.property((0, convertToIndexableExpression_1.convertToIndexableExpression)(expression), "constructor"), [
            luau_ast_1.default.globals.self,
            ...(0, ensureTransformOrder_1.ensureTransformOrder)(state, node.arguments),
        ]);
    }
    const expType = state.typeChecker.getNonOptionalType(state.getType(node.expression));
    const symbol = (0, types_1.getFirstDefinedSymbol)(state, expType);
    if (symbol) {
        const macro = state.services.macroManager.getCallMacro(symbol);
        if (macro) {
            return runCallMacro(macro, state, node, expression, nodeArguments);
        }
    }
    const [args, prereqs] = state.capture(() => (0, ensureTransformOrder_1.ensureTransformOrder)(state, nodeArguments));
    fixVoidArgumentsForRobloxFunctions(state, expType, args, nodeArguments);
    if (!luau_ast_1.default.list.isEmpty(prereqs) && (0, expressionMightMutate_1.expressionMightMutate)(state, expression, node.expression)) {
        expression = state.pushToVar(expression, "fn");
    }
    state.prereqList(prereqs);
    const exp = luau_ast_1.default.call((0, convertToIndexableExpression_1.convertToIndexableExpression)(expression), args);
    return (0, wrapReturnIfLuaTuple_1.wrapReturnIfLuaTuple)(state, node, exp);
}
function transformPropertyCallExpressionInner(state, node, expression, baseExpression, name, nodeArguments) {
    (0, validateNotAny_1.validateNotAnyType)(state, expression.expression);
    (0, validateNotAny_1.validateNotAnyType)(state, node.expression);
    if (typescript_1.default.isSuperProperty(expression)) {
        return luau_ast_1.default.call(luau_ast_1.default.property((0, convertToIndexableExpression_1.convertToIndexableExpression)(baseExpression), expression.name.text), [
            luau_ast_1.default.globals.self,
            ...(0, ensureTransformOrder_1.ensureTransformOrder)(state, node.arguments),
        ]);
    }
    const expType = state.typeChecker.getNonOptionalType(state.getType(node.expression));
    const symbol = (0, types_1.getFirstDefinedSymbol)(state, expType);
    if (symbol) {
        const macro = state.services.macroManager.getPropertyCallMacro(symbol);
        if (macro) {
            return runCallMacro(macro, state, node, baseExpression, nodeArguments);
        }
    }
    const [args, prereqs] = state.capture(() => (0, ensureTransformOrder_1.ensureTransformOrder)(state, nodeArguments));
    fixVoidArgumentsForRobloxFunctions(state, expType, args, nodeArguments);
    if (!luau_ast_1.default.list.isEmpty(prereqs) && (0, expressionMightMutate_1.expressionMightMutate)(state, baseExpression, expression.expression)) {
        baseExpression = state.pushToVar(baseExpression);
    }
    state.prereqList(prereqs);
    let exp;
    if ((0, isMethod_1.isMethod)(state, expression)) {
        if (luau_ast_1.default.isValidIdentifier(name)) {
            exp = luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.MethodCallExpression, {
                name,
                expression: (0, convertToIndexableExpression_1.convertToIndexableExpression)(baseExpression),
                args: luau_ast_1.default.list.make(...args),
            });
        }
        else {
            baseExpression = state.pushToVarIfComplex(baseExpression);
            args.unshift(baseExpression);
            exp = luau_ast_1.default.call(luau_ast_1.default.property((0, convertToIndexableExpression_1.convertToIndexableExpression)(baseExpression), name), args);
        }
    }
    else {
        exp = luau_ast_1.default.call(luau_ast_1.default.property((0, convertToIndexableExpression_1.convertToIndexableExpression)(baseExpression), name), args);
    }
    return (0, wrapReturnIfLuaTuple_1.wrapReturnIfLuaTuple)(state, node, exp);
}
function transformElementCallExpressionInner(state, node, expression, baseExpression, argumentExpression, nodeArguments) {
    (0, validateNotAny_1.validateNotAnyType)(state, expression.expression);
    (0, validateNotAny_1.validateNotAnyType)(state, expression.argumentExpression);
    (0, validateNotAny_1.validateNotAnyType)(state, node.expression);
    if (typescript_1.default.isSuperProperty(expression)) {
        return luau_ast_1.default.call(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
            expression: (0, convertToIndexableExpression_1.convertToIndexableExpression)(baseExpression),
            index: (0, transformExpression_1.transformExpression)(state, expression.argumentExpression),
        }), [luau_ast_1.default.globals.self, ...(0, ensureTransformOrder_1.ensureTransformOrder)(state, node.arguments)]);
    }
    const expType = state.typeChecker.getNonOptionalType(state.getType(node.expression));
    const symbol = (0, types_1.getFirstDefinedSymbol)(state, expType);
    if (symbol) {
        const macro = state.services.macroManager.getPropertyCallMacro(symbol);
        if (macro) {
            return runCallMacro(macro, state, node, baseExpression, nodeArguments);
        }
    }
    const [[argumentExp, ...args], prereqs] = state.capture(() => (0, ensureTransformOrder_1.ensureTransformOrder)(state, [argumentExpression, ...nodeArguments]));
    fixVoidArgumentsForRobloxFunctions(state, expType, args, nodeArguments);
    if (!luau_ast_1.default.list.isEmpty(prereqs) && (0, expressionMightMutate_1.expressionMightMutate)(state, baseExpression, expression.expression)) {
        baseExpression = state.pushToVar(baseExpression);
    }
    state.prereqList(prereqs);
    if ((0, isMethod_1.isMethod)(state, expression)) {
        baseExpression = state.pushToVarIfComplex(baseExpression);
        args.unshift(baseExpression);
    }
    const exp = luau_ast_1.default.call(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
        expression: (0, convertToIndexableExpression_1.convertToIndexableExpression)(baseExpression),
        index: (0, addOneIfArrayType_1.addOneIfArrayType)(state, state.typeChecker.getNonOptionalType(state.getType(expression.expression)), argumentExp),
    }), args);
    return (0, wrapReturnIfLuaTuple_1.wrapReturnIfLuaTuple)(state, node, exp);
}
function transformCallExpression(state, node) {
    return (0, transformOptionalChain_1.transformOptionalChain)(state, node);
}
//# sourceMappingURL=transformCallExpression.js.map