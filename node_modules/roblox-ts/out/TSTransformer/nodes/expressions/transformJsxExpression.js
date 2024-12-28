"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformJsxExpression = transformJsxExpression;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const transformExpression_1 = require("./transformExpression");
function transformJsxExpression(state, node) {
    if (node.expression) {
        const expression = (0, transformExpression_1.transformExpression)(state, node.expression);
        if (node.dotDotDotToken) {
            return luau_ast_1.default.call(luau_ast_1.default.globals.unpack, [expression]);
        }
        return expression;
    }
    return luau_ast_1.default.none();
}
//# sourceMappingURL=transformJsxExpression.js.map