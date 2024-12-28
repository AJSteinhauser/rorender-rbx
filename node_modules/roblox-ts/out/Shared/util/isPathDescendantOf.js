"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPathDescendantOf = isPathDescendantOf;
const path_1 = __importDefault(require("path"));
function isPathDescendantOf(filePath, dirPath) {
    return dirPath === filePath || !path_1.default.relative(dirPath, filePath).startsWith("..");
}
//# sourceMappingURL=isPathDescendantOf.js.map