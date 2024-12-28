"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformClassExpression = transformClassExpression;
const transformClassLikeDeclaration_1 = require("../class/transformClassLikeDeclaration");
function transformClassExpression(state, node) {
    const { statements, name } = (0, transformClassLikeDeclaration_1.transformClassLikeDeclaration)(state, node);
    state.prereqList(statements);
    return name;
}
//# sourceMappingURL=transformClassExpression.js.map