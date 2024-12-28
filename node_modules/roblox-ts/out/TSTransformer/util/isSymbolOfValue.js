"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSymbolOfValue = isSymbolOfValue;
const typescript_1 = __importDefault(require("typescript"));
function isSymbolOfValue(symbol) {
    return !!(symbol.flags & typescript_1.default.SymbolFlags.Value) && !(symbol.flags & typescript_1.default.SymbolFlags.ConstEnum);
}
//# sourceMappingURL=isSymbolOfValue.js.map