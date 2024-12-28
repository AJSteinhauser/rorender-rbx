"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDecorators = transformDecorators;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const assert_1 = require("../../../Shared/util/assert");
const transformExpression_1 = require("../expressions/transformExpression");
const transformPropertyName_1 = require("../transformPropertyName");
const convertToIndexableExpression_1 = require("../../util/convertToIndexableExpression");
const expressionMightMutate_1 = require("../../util/expressionMightMutate");
const findConstructor_1 = require("../../util/findConstructor");
const typescript_1 = __importDefault(require("typescript"));
function countDecorators(node) {
    var _a, _b;
    return (_b = (_a = typescript_1.default.getDecorators(node)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
}
function shouldInline(state, isLastDecorator, decorator, expression) {
    if (!(0, expressionMightMutate_1.expressionMightMutate)(state, expression, decorator.expression))
        return true;
    if (!isLastDecorator)
        return false;
    const node = decorator.parent;
    if (typescript_1.default.isMethodDeclaration(node) && node.parameters.some(parameter => countDecorators(parameter) > 0))
        return false;
    if (typescript_1.default.isClassLike(node)) {
        const constructor = (0, findConstructor_1.findConstructor)(node);
        if (constructor && constructor.parameters.some(parameter => countDecorators(parameter) > 0))
            return false;
    }
    if (typescript_1.default.isParameter(node)) {
        const parameters = node.parent.parameters;
        const paramIdx = parameters.findIndex(param => param === node);
        for (let i = paramIdx + 1; i < parameters.length; i++) {
            if (countDecorators(parameters[i]) > 0) {
                return false;
            }
        }
    }
    return true;
}
function transformMemberDecorators(state, node, callback) {
    var _a;
    const initializers = luau_ast_1.default.list.make();
    const finalizers = luau_ast_1.default.list.make();
    const decorators = (_a = typescript_1.default.getDecorators(node)) !== null && _a !== void 0 ? _a : [];
    for (let i = 0; i < decorators.length; i++) {
        const decorator = decorators[i];
        let [expression, prereqs] = state.capture(() => (0, transformExpression_1.transformExpression)(state, decorator.expression));
        luau_ast_1.default.list.pushList(initializers, prereqs);
        const isLastDecorator = i === decorators.length - 1;
        if (!shouldInline(state, isLastDecorator, decorator, expression)) {
            const tempId = luau_ast_1.default.tempId("decorator");
            luau_ast_1.default.list.push(initializers, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.VariableDeclaration, {
                left: tempId,
                right: expression,
            }));
            expression = tempId;
        }
        luau_ast_1.default.list.unshiftList(finalizers, callback((0, convertToIndexableExpression_1.convertToIndexableExpression)(expression)));
    }
    return [initializers, finalizers];
}
function transformMethodDecorators(state, member, classId) {
    const [initializers, finalizers] = transformMemberDecorators(state, member, expression => {
        const result = luau_ast_1.default.list.make();
        const descriptorId = luau_ast_1.default.tempId("descriptor");
        const key = state.getClassElementObjectKey(member);
        (0, assert_1.assert)(key, "Did not find method key for method decorator");
        luau_ast_1.default.list.push(result, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.VariableDeclaration, {
            left: descriptorId,
            right: luau_ast_1.default.call(expression, [
                classId,
                key,
                luau_ast_1.default.map([
                    [
                        luau_ast_1.default.string("value"),
                        luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
                            expression: classId,
                            index: key,
                        }),
                    ],
                ]),
            ]),
        }));
        luau_ast_1.default.list.push(result, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.IfStatement, {
            condition: descriptorId,
            statements: luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
                left: luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
                    expression: classId,
                    index: key,
                }),
                operator: "=",
                right: luau_ast_1.default.property(descriptorId, "value"),
            })),
            elseBody: luau_ast_1.default.list.make(),
        }));
        return result;
    });
    const result = luau_ast_1.default.list.make();
    luau_ast_1.default.list.pushList(result, initializers);
    luau_ast_1.default.list.pushList(result, transformParameterDecorators(state, member, classId));
    luau_ast_1.default.list.pushList(result, finalizers);
    return result;
}
function transformPropertyDecorators(state, member, classId) {
    const [initializers, finalizers] = transformMemberDecorators(state, member, expression => {
        const key = state.noPrereqs(() => (0, transformPropertyName_1.transformPropertyName)(state, member.name));
        return luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.CallStatement, {
            expression: luau_ast_1.default.call(expression, [classId, key]),
        }));
    });
    const result = luau_ast_1.default.list.make();
    luau_ast_1.default.list.pushList(result, initializers);
    luau_ast_1.default.list.pushList(result, finalizers);
    return result;
}
function transformParameterDecorators(state, member, classId) {
    const initializers = luau_ast_1.default.list.make();
    const finalizers = luau_ast_1.default.list.make();
    for (let i = 0; i < member.parameters.length; i++) {
        const parameter = member.parameters[i];
        const [paramInitializers, paramFinalizers] = transformMemberDecorators(state, parameter, expression => {
            const key = member.name ? state.getClassElementObjectKey(member) : luau_ast_1.default.nil();
            (0, assert_1.assert)(key, "Did not find method key for parameter decorator");
            return luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.CallStatement, {
                expression: luau_ast_1.default.call(expression, [classId, key, luau_ast_1.default.number(i)]),
            }));
        });
        luau_ast_1.default.list.pushList(initializers, paramInitializers);
        luau_ast_1.default.list.unshiftList(finalizers, paramFinalizers);
    }
    const result = luau_ast_1.default.list.make();
    luau_ast_1.default.list.pushList(result, initializers);
    luau_ast_1.default.list.pushList(result, finalizers);
    return result;
}
function transformClassDecorators(state, node, classId) {
    const [initializers, finalizers] = transformMemberDecorators(state, node, expression => luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
        left: classId,
        operator: "=",
        right: luau_ast_1.default.binary(luau_ast_1.default.call(expression, [classId]), "or", classId),
    })));
    const result = luau_ast_1.default.list.make();
    luau_ast_1.default.list.pushList(result, initializers);
    const constructor = (0, findConstructor_1.findConstructor)(node);
    if (constructor) {
        luau_ast_1.default.list.pushList(result, transformParameterDecorators(state, constructor, classId));
    }
    luau_ast_1.default.list.pushList(result, finalizers);
    return result;
}
function transformDecorators(state, node, classId) {
    const result = luau_ast_1.default.list.make();
    for (const member of node.members) {
        if (!typescript_1.default.hasStaticModifier(member)) {
            if (typescript_1.default.isMethodDeclaration(member) && member.body) {
                luau_ast_1.default.list.pushList(result, transformMethodDecorators(state, member, classId));
            }
            else if (typescript_1.default.isPropertyDeclaration(member)) {
                luau_ast_1.default.list.pushList(result, transformPropertyDecorators(state, member, classId));
            }
        }
    }
    for (const member of node.members) {
        if (typescript_1.default.hasStaticModifier(member)) {
            if (typescript_1.default.isMethodDeclaration(member) && member.body) {
                luau_ast_1.default.list.pushList(result, transformMethodDecorators(state, member, classId));
            }
            else if (typescript_1.default.isPropertyDeclaration(member)) {
                luau_ast_1.default.list.pushList(result, transformPropertyDecorators(state, member, classId));
            }
        }
    }
    luau_ast_1.default.list.pushList(result, transformClassDecorators(state, node, classId));
    return result;
}
//# sourceMappingURL=transformDecorators.js.map