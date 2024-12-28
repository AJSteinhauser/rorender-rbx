"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasErrors = hasErrors;
const typescript_1 = __importDefault(require("typescript"));
function hasErrors(diagnostics) {
    return diagnostics.some(d => d.category === typescript_1.default.DiagnosticCategory.Error);
}
//# sourceMappingURL=hasErrors.js.map