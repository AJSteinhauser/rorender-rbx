"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayBindingPatternContainsHoists = arrayBindingPatternContainsHoists;
const checkVariableHoist_1 = require("./checkVariableHoist");
const typescript_1 = __importDefault(require("typescript"));
function arrayBindingPatternContainsHoists(state, arrayBindingPattern) {
    for (const element of arrayBindingPattern.elements) {
        if (typescript_1.default.isBindingElement(element) && typescript_1.default.isIdentifier(element.name)) {
            const symbol = state.typeChecker.getSymbolAtLocation(element.name);
            if (symbol) {
                (0, checkVariableHoist_1.checkVariableHoist)(state, element.name, symbol);
                if (state.isHoisted.get(symbol)) {
                    return true;
                }
            }
        }
    }
    return false;
}
//# sourceMappingURL=arrayBindingPatternContainsHoists.js.map