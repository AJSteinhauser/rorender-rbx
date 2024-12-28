"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTextDiagnostic = createTextDiagnostic;
const typescript_1 = __importDefault(require("typescript"));
function createTextDiagnostic(messageText, category = typescript_1.default.DiagnosticCategory.Error) {
    return {
        category,
        code: " roblox-ts",
        file: undefined,
        messageText,
        start: undefined,
        length: undefined,
    };
}
//# sourceMappingURL=createTextDiagnostic.js.map