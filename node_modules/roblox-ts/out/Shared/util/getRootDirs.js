"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRootDirs = getRootDirs;
const assert_1 = require("./assert");
function getRootDirs(compilerOptions) {
    const rootDirs = compilerOptions.rootDir ? [compilerOptions.rootDir] : compilerOptions.rootDirs;
    (0, assert_1.assert)(rootDirs);
    return rootDirs;
}
//# sourceMappingURL=getRootDirs.js.map