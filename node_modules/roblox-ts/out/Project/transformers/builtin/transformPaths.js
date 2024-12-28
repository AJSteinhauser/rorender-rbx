"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = transformer;
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
const url_1 = __importDefault(require("url"));
const getImplicitExtensions = (options) => {
    let res = [".ts", ".d.ts"];
    let { allowJs, jsx, resolveJsonModule: allowJson } = options;
    const allowJsx = !!jsx && jsx !== typescript_1.default.JsxEmit.None;
    allowJs && res.push(".js");
    allowJsx && res.push(".tsx");
    allowJs && allowJsx && res.push(".jsx");
    allowJson && res.push(".json");
    return res;
};
const isURL = (s) => !!s && (!!url_1.default.parse(s).host || !!url_1.default.parse(s).hostname);
const isBaseDir = (base, dir) => { var _a; return ((_a = path_1.default.relative(base, dir)) === null || _a === void 0 ? void 0 : _a[0]) !== "."; };
const isRequire = (node) => typescript_1.default.isCallExpression(node) &&
    typescript_1.default.isIdentifier(node.expression) &&
    node.expression.text === "require" &&
    typescript_1.default.isStringLiteral(node.arguments[0]) &&
    node.arguments.length === 1;
const isAsyncImport = (node) => typescript_1.default.isCallExpression(node) &&
    node.expression.kind === typescript_1.default.SyntaxKind.ImportKeyword &&
    typescript_1.default.isStringLiteral(node.arguments[0]) &&
    node.arguments.length === 1;
function transformer(program, config) {
    const { useRootDirs } = config;
    const compilerOptions = program.getCompilerOptions();
    const implicitExtensions = getImplicitExtensions(compilerOptions);
    return (context) => (sourceFile) => {
        var _a;
        if (typescript_1.default.isBundle(sourceFile))
            return sourceFile;
        const factory = context.factory;
        const { fileName } = sourceFile;
        const fileDir = typescript_1.default.normalizePath(path_1.default.dirname(fileName));
        if (!compilerOptions.baseUrl && !compilerOptions.paths)
            return sourceFile;
        let rootDirs = (_a = compilerOptions.rootDirs) === null || _a === void 0 ? void 0 : _a.filter(path_1.default.isAbsolute);
        return typescript_1.default.visitEachChild(sourceFile, visit, context);
        function update(original, moduleName, updaterFn) {
            let p;
            const { resolvedModule, failedLookupLocations } = typescript_1.default.resolveModuleName(moduleName, fileName, compilerOptions, typescript_1.default.sys);
            if (!resolvedModule) {
                const maybeURL = failedLookupLocations[0];
                if (!isURL(maybeURL))
                    return original;
                p = maybeURL;
            }
            else if (resolvedModule.isExternalLibraryImport)
                return original;
            else {
                const { extension, resolvedFileName } = resolvedModule;
                let filePath = fileDir;
                let modulePath = path_1.default.dirname(resolvedFileName);
                if (useRootDirs && rootDirs) {
                    let fileRootDir = "";
                    let moduleRootDir = "";
                    for (const rootDir of rootDirs) {
                        if (isBaseDir(rootDir, resolvedFileName) && rootDir.length > moduleRootDir.length)
                            moduleRootDir = rootDir;
                        if (isBaseDir(rootDir, fileName) && rootDir.length > fileRootDir.length)
                            fileRootDir = rootDir;
                    }
                    if (fileRootDir && moduleRootDir) {
                        filePath = path_1.default.relative(fileRootDir, filePath);
                        modulePath = path_1.default.relative(moduleRootDir, modulePath);
                    }
                }
                p = typescript_1.default.normalizePath(path_1.default.join(path_1.default.relative(filePath, modulePath), path_1.default.basename(resolvedFileName)));
                if (extension && implicitExtensions.includes(extension))
                    p = p.slice(0, -extension.length);
                if (!p)
                    return original;
                p = p[0] === "." ? p : `./${p}`;
            }
            const newStringLiteral = factory.createStringLiteral(p);
            return updaterFn(newStringLiteral);
        }
        function visit(node) {
            if (isRequire(node) || isAsyncImport(node))
                return update(node, node.arguments[0].text, p => {
                    const res = factory.updateCallExpression(node, node.expression, node.typeArguments, [p]);
                    const textNode = node.arguments[0];
                    const commentRanges = typescript_1.default.getLeadingCommentRanges(textNode.getFullText(), 0) || [];
                    for (const range of commentRanges) {
                        const { kind, pos, end, hasTrailingNewLine } = range;
                        const caption = textNode
                            .getFullText()
                            .substr(pos, end)
                            .replace(kind === typescript_1.default.SyntaxKind.MultiLineCommentTrivia
                            ?
                                /^\/\*(.+)\*\/.*/s
                            : /^\/\/(.+)/s, "$1");
                        typescript_1.default.addSyntheticLeadingComment(p, kind, caption, hasTrailingNewLine);
                    }
                    return res;
                });
            if (typescript_1.default.isExternalModuleReference(node) && typescript_1.default.isStringLiteral(node.expression))
                return update(node, node.expression.text, p => factory.updateExternalModuleReference(node, p));
            if ((typescript_1.default.isImportDeclaration(node) || typescript_1.default.isExportDeclaration(node)) &&
                node.moduleSpecifier &&
                typescript_1.default.isStringLiteral(node.moduleSpecifier))
                return update(node, node.moduleSpecifier.text, p => {
                    const newNode = factory.cloneNode(node.moduleSpecifier);
                    typescript_1.default.setSourceMapRange(newNode, typescript_1.default.getSourceMapRange(node));
                    typescript_1.default.setTextRange(newNode, node.moduleSpecifier);
                    newNode.text = p.text;
                    return Object.assign(node, { moduleSpecifier: newNode });
                });
            if (typescript_1.default.isImportTypeNode(node)) {
                const argument = node.argument;
                if (!typescript_1.default.isStringLiteral(argument.literal))
                    return node;
                const { text } = argument.literal;
                return !text
                    ? node
                    : update(node, text, p => factory.updateImportTypeNode(node, factory.updateLiteralTypeNode(argument, p), node.attributes, node.qualifier, node.typeArguments, node.isTypeOf));
            }
            return typescript_1.default.visitEachChild(node, visit, context);
        }
    };
}
//# sourceMappingURL=transformPaths.js.map