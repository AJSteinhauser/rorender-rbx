"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformJsx = transformJsx;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const assert_1 = require("../../../Shared/util/assert");
const transformJsxAttributes_1 = require("./transformJsxAttributes");
const transformJsxChildren_1 = require("./transformJsxChildren");
const transformJsxTagName_1 = require("./transformJsxTagName");
const transformEntityName_1 = require("../transformEntityName");
const convertToIndexableExpression_1 = require("../../util/convertToIndexableExpression");
const pointer_1 = require("../../util/pointer");
function transformJsx(state, node, tagName, attributes, children) {
    const jsxFactoryEntity = state.resolver.getJsxFactoryEntity(node);
    (0, assert_1.assert)(jsxFactoryEntity, "Expected jsxFactoryEntity to be defined");
    const createElementExpression = (0, convertToIndexableExpression_1.convertToIndexableExpression)((0, transformEntityName_1.transformEntityName)(state, jsxFactoryEntity));
    const tagNameExp = (0, transformJsxTagName_1.transformJsxTagName)(state, tagName);
    let attributesPtr;
    if (attributes.properties.length > 0) {
        attributesPtr = (0, pointer_1.createMapPointer)("attributes");
        (0, transformJsxAttributes_1.transformJsxAttributes)(state, attributes, attributesPtr);
    }
    const transformedChildren = (0, transformJsxChildren_1.transformJsxChildren)(state, children);
    const args = [tagNameExp];
    if (attributesPtr) {
        args.push(attributesPtr.value);
    }
    else if (transformedChildren.length > 0) {
        args.push(luau_ast_1.default.nil());
    }
    args.push(...transformedChildren);
    return luau_ast_1.default.call(createElementExpression, args);
}
//# sourceMappingURL=transformJsx.js.map