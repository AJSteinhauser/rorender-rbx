"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findConstructor = findConstructor;
const typescript_1 = __importDefault(require("typescript"));
function findConstructor(node) {
    return node.members.find((member) => typescript_1.default.isConstructorDeclaration(member) && member.body !== undefined);
}
//# sourceMappingURL=findConstructor.js.map