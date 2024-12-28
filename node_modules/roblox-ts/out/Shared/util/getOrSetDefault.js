"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrSetDefault = getOrSetDefault;
function getOrSetDefault(map, key, getDefaultValue) {
    let value = map.get(key);
    if (value === undefined) {
        value = getDefaultValue();
        map.set(key, value);
    }
    return value;
}
//# sourceMappingURL=getOrSetDefault.js.map