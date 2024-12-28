"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMapPointer = createMapPointer;
exports.createArrayPointer = createArrayPointer;
exports.assignToMapPointer = assignToMapPointer;
exports.disableMapInline = disableMapInline;
exports.disableArrayInline = disableArrayInline;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
function createMapPointer(name) {
    return { name, value: luau_ast_1.default.map() };
}
function createArrayPointer(name) {
    return { name, value: luau_ast_1.default.array() };
}
function assignToMapPointer(state, ptr, left, right) {
    if (luau_ast_1.default.isMap(ptr.value)) {
        luau_ast_1.default.list.push(ptr.value.fields, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.MapField, {
            index: left,
            value: right,
        }));
    }
    else {
        state.prereq(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
            left: luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
                expression: ptr.value,
                index: left,
            }),
            operator: "=",
            right,
        }));
    }
}
function disableMapInline(state, ptr) {
    if (luau_ast_1.default.isMap(ptr.value)) {
        ptr.value = state.pushToVar(ptr.value, ptr.name);
    }
}
function disableArrayInline(state, ptr) {
    if (luau_ast_1.default.isArray(ptr.value)) {
        ptr.value = state.pushToVar(ptr.value, ptr.name);
    }
}
//# sourceMappingURL=pointer.js.map