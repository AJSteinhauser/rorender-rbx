"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.benchmarkSync = benchmarkSync;
exports.benchmarkIfVerbose = benchmarkIfVerbose;
exports.benchmark = benchmark;
const LogService_1 = require("../classes/LogService");
function benchmarkStart(name) {
    LogService_1.LogService.write(`${name}`);
    return Date.now();
}
function benchmarkEnd(startTime) {
    LogService_1.LogService.write(` ( ${Date.now() - startTime} ms )\n`);
}
function benchmarkSync(name, callback) {
    const startTime = benchmarkStart(name);
    callback();
    benchmarkEnd(startTime);
}
function benchmarkIfVerbose(name, callback) {
    if (LogService_1.LogService.verbose) {
        benchmarkSync(name, callback);
    }
    else {
        callback();
    }
}
async function benchmark(name, callback) {
    const startTime = benchmarkStart(name);
    await callback();
    benchmarkEnd(startTime);
}
//# sourceMappingURL=benchmark.js.map