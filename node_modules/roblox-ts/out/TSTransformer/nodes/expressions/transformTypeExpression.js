"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformTypeExpression = transformTypeExpression;
const transformExpression_1 = require("./transformExpression");
function transformTypeExpression(state, node) {
    return (0, transformExpression_1.transformExpression)(state, node.expression);
}
//# sourceMappingURL=transformTypeExpression.js.map