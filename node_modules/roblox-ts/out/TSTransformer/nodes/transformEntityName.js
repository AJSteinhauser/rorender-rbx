"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformEntityName = transformEntityName;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const transformIdentifier_1 = require("./expressions/transformIdentifier");
const convertToIndexableExpression_1 = require("../util/convertToIndexableExpression");
const validateIdentifier_1 = require("../util/validateIdentifier");
const typescript_1 = __importDefault(require("typescript"));
function transformEntityName(state, node) {
    if (typescript_1.default.isIdentifier(node)) {
        (0, validateIdentifier_1.validateIdentifier)(state, node);
        return (0, transformIdentifier_1.transformIdentifier)(state, node);
    }
    else {
        return transformQualifiedName(state, node);
    }
}
function transformQualifiedName(state, node) {
    return luau_ast_1.default.property((0, convertToIndexableExpression_1.convertToIndexableExpression)(transformEntityName(state, node.left)), node.right.text);
}
//# sourceMappingURL=transformEntityName.js.map