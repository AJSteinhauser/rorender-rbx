"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlags = getFlags;
function getFlags(flags, from) {
    const results = new Array();
    for (const [flagName, flagValue] of Object.entries(from)) {
        if (typeof flagValue === "number" && !!(flags & flagValue)) {
            results.push(flagName);
        }
    }
    return results;
}
//# sourceMappingURL=getFlags.js.map