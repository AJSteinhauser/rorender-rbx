"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransformServices = createTransformServices;
const TSTransformer_1 = require("..");
function createTransformServices(typeChecker) {
    const macroManager = new TSTransformer_1.MacroManager(typeChecker);
    return { macroManager };
}
//# sourceMappingURL=createTransformServices.js.map