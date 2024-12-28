"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = assert;
function assert(value, message) {
    if (!value) {
        debugger;
        throw new Error(`Assertion Failed! ${message !== null && message !== void 0 ? message : ""}` +
            "\nThis is a compiler bug! Please submit a bug report here:" +
            "\nhttps://github.com/roblox-ts/roblox-ts/issues");
    }
}
//# sourceMappingURL=assert.js.map