"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformYieldExpression = transformYieldExpression;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const transformExpression_1 = require("./transformExpression");
const convertToIndexableExpression_1 = require("../../util/convertToIndexableExpression");
const isUsedAsStatement_1 = require("../../util/isUsedAsStatement");
function transformYieldExpression(state, node) {
    if (!node.expression) {
        return luau_ast_1.default.call(luau_ast_1.default.globals.coroutine.yield, []);
    }
    const expression = (0, transformExpression_1.transformExpression)(state, node.expression);
    if (node.asteriskToken) {
        const loopId = luau_ast_1.default.tempId("result");
        const finalizer = luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.BreakStatement, {}));
        let evaluated = luau_ast_1.default.none();
        if (!(0, isUsedAsStatement_1.isUsedAsStatement)(node)) {
            const returnValue = state.pushToVar(undefined, "returnValue");
            luau_ast_1.default.list.unshift(finalizer, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
                left: returnValue,
                operator: "=",
                right: luau_ast_1.default.property(loopId, "value"),
            }));
            evaluated = returnValue;
        }
        state.prereq(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ForStatement, {
            ids: luau_ast_1.default.list.make(loopId),
            expression: luau_ast_1.default.property((0, convertToIndexableExpression_1.convertToIndexableExpression)(expression), "next"),
            statements: luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.IfStatement, {
                condition: luau_ast_1.default.property(loopId, "done"),
                statements: finalizer,
                elseBody: luau_ast_1.default.list.make(),
            }), luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.CallStatement, {
                expression: luau_ast_1.default.call(luau_ast_1.default.globals.coroutine.yield, [luau_ast_1.default.property(loopId, "value")]),
            })),
        }));
        return evaluated;
    }
    else {
        return luau_ast_1.default.call(luau_ast_1.default.globals.coroutine.yield, [expression]);
    }
}
//# sourceMappingURL=transformYieldExpression.js.map