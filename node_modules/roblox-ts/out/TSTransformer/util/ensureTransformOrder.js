"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureTransformOrder = ensureTransformOrder;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const findLastIndex_1 = require("../../Shared/util/findLastIndex");
const transformExpression_1 = require("../nodes/expressions/transformExpression");
const isSymbolMutable_1 = require("./isSymbolMutable");
const typescript_1 = __importDefault(require("typescript"));
function ensureTransformOrder(state, nodes, transformer = transformExpression_1.transformExpression) {
    const expressionInfoList = nodes.map(node => state.capture(() => transformer(state, node)));
    const lastArgWithPrereqsIndex = (0, findLastIndex_1.findLastIndex)(expressionInfoList, ([, prereqs]) => !luau_ast_1.default.list.isEmpty(prereqs));
    const result = new Array();
    for (let i = 0; i < expressionInfoList.length; i++) {
        const [expression, prereqs] = expressionInfoList[i];
        state.prereqList(prereqs);
        let isConstVar = false;
        const exp = nodes[i];
        if (typescript_1.default.isIdentifier(exp)) {
            const symbol = state.typeChecker.getSymbolAtLocation(exp);
            if (symbol && !(0, isSymbolMutable_1.isSymbolMutable)(state, symbol)) {
                isConstVar = true;
            }
        }
        if (i < lastArgWithPrereqsIndex &&
            !luau_ast_1.default.isSimplePrimitive(expression) &&
            !luau_ast_1.default.isTemporaryIdentifier(expression) &&
            !isConstVar) {
            result.push(state.pushToVar(expression, "exp"));
        }
        else {
            result.push(expression);
        }
    }
    return result;
}
//# sourceMappingURL=ensureTransformOrder.js.map