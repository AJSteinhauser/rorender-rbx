"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFiles = copyFiles;
const copyItem_1 = require("./copyItem");
const benchmark_1 = require("../../Shared/util/benchmark");
function copyFiles(data, pathTranslator, sources) {
    (0, benchmark_1.benchmarkIfVerbose)("copy non-compiled files", () => {
        for (const source of sources) {
            (0, copyItem_1.copyItem)(data, pathTranslator, source);
        }
    });
}
//# sourceMappingURL=copyFiles.js.map