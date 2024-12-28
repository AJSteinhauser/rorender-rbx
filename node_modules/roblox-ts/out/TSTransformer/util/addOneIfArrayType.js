"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOneIfArrayType = addOneIfArrayType;
const offset_1 = require("./offset");
const types_1 = require("./types");
function addOneIfArrayType(state, type, expression) {
    if ((0, types_1.isDefinitelyType)(type, (0, types_1.isArrayType)(state), types_1.isUndefinedType)) {
        return (0, offset_1.offset)(expression, 1);
    }
    else {
        return expression;
    }
}
//# sourceMappingURL=addOneIfArrayType.js.map