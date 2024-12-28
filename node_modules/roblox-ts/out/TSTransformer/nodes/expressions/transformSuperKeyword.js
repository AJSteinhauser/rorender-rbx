"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformSuperKeyword = transformSuperKeyword;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
function transformSuperKeyword() {
    return luau_ast_1.default.globals.super;
}
//# sourceMappingURL=transformSuperKeyword.js.map