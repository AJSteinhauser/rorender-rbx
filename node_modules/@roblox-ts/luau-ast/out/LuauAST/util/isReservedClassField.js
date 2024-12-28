"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReservedClassField = void 0;
const LUAU_RESERVED_CLASS_FIELDS = new Set(["__index", "new"]);
function isReservedClassField(id) {
    return LUAU_RESERVED_CLASS_FIELDS.has(id);
}
exports.isReservedClassField = isReservedClassField;
//# sourceMappingURL=isReservedClassField.js.map