"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformJsxFragment = transformJsxFragment;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const assert_1 = require("../../../Shared/util/assert");
const transformJsxChildren_1 = require("../jsx/transformJsxChildren");
const transformEntityName_1 = require("../transformEntityName");
const convertToIndexableExpression_1 = require("../../util/convertToIndexableExpression");
const typescript_1 = __importDefault(require("typescript"));
function transformJsxFragment(state, node) {
    var _a;
    const jsxFactoryEntity = state.resolver.getJsxFactoryEntity(node);
    (0, assert_1.assert)(jsxFactoryEntity, "Expected jsxFactoryEntity to be defined");
    const createElementExpression = (0, convertToIndexableExpression_1.convertToIndexableExpression)((0, transformEntityName_1.transformEntityName)(state, jsxFactoryEntity));
    const jsxFragmentFactoryEntity = (_a = state.resolver.getJsxFragmentFactoryEntity(node)) !== null && _a !== void 0 ? _a : typescript_1.default.parseIsolatedEntityName("Fragment", typescript_1.default.ScriptTarget.ESNext);
    (0, assert_1.assert)(jsxFragmentFactoryEntity, "Unable to find valid jsxFragmentFactoryEntity");
    const args = [(0, transformEntityName_1.transformEntityName)(state, jsxFragmentFactoryEntity)];
    const transformedChildren = (0, transformJsxChildren_1.transformJsxChildren)(state, node.children);
    if (transformedChildren.length > 0) {
        args.push(luau_ast_1.default.nil());
    }
    args.push(...transformedChildren);
    return luau_ast_1.default.call(createElementExpression, args);
}
//# sourceMappingURL=transformJsxFragment.js.map