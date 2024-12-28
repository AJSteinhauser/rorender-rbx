"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSourceFileFromModuleSpecifier = getSourceFileFromModuleSpecifier;
const typescript_1 = __importDefault(require("typescript"));
function getSourceFileFromModuleSpecifier(state, moduleSpecifier) {
    var _a;
    const symbol = (_a = state.typeChecker.getSymbolAtLocation(moduleSpecifier)) !== null && _a !== void 0 ? _a : state.typeChecker.resolveExternalModuleName(moduleSpecifier);
    if (symbol) {
        const declaration = symbol.valueDeclaration;
        if (declaration && typescript_1.default.isModuleDeclaration(declaration) && typescript_1.default.isStringLiteralLike(declaration.name)) {
            const sourceFile = moduleSpecifier.getSourceFile();
            const mode = state.program.getModeForUsageLocation(sourceFile, declaration.name);
            const resolvedModuleInfo = state.program.getResolvedModule(sourceFile, declaration.name.text, mode);
            if (resolvedModuleInfo && resolvedModuleInfo.resolvedModule) {
                return state.program.getSourceFile(resolvedModuleInfo.resolvedModule.resolvedFileName);
            }
        }
        if (declaration && typescript_1.default.isSourceFile(declaration)) {
            return declaration;
        }
    }
    if (typescript_1.default.isStringLiteralLike(moduleSpecifier)) {
        const sourceFile = moduleSpecifier.getSourceFile();
        const result = typescript_1.default.resolveModuleName(moduleSpecifier.text, sourceFile.path, state.compilerOptions, typescript_1.default.sys);
        if (result.resolvedModule) {
            return state.program.getSourceFile(result.resolvedModule.resolvedFileName);
        }
    }
}
//# sourceMappingURL=getSourceFileFromModuleSpecifier.js.map