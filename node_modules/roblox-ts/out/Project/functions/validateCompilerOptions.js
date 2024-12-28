"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCompilerOptions = validateCompilerOptions;
const fs_1 = __importDefault(require("fs"));
const kleur_1 = __importDefault(require("kleur"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../../Shared/constants");
const ProjectError_1 = require("../../Shared/errors/ProjectError");
const typescript_1 = __importDefault(require("typescript"));
const ENFORCED_OPTIONS = {
    target: typescript_1.default.ScriptTarget.ESNext,
    module: typescript_1.default.ModuleKind.CommonJS,
    moduleDetection: typescript_1.default.ModuleDetectionKind.Force,
    moduleResolution: typescript_1.default.ModuleResolutionKind.Node10,
    noLib: true,
    strict: true,
    allowSyntheticDefaultImports: true,
};
function y(str) {
    return kleur_1.default.yellow(str);
}
function validateTypeRoots(nodeModulesPath, typeRoots) {
    const typesPath = path_1.default.resolve(nodeModulesPath);
    for (const typeRoot of typeRoots) {
        if (path_1.default.resolve(typeRoot) === typesPath) {
            return true;
        }
    }
    return false;
}
function validateCompilerOptions(opts, projectPath) {
    var _a, _b;
    const errors = new Array();
    if (opts.noLib !== ENFORCED_OPTIONS.noLib) {
        errors.push(`${y(`"noLib"`)} must be ${y(`true`)}`);
    }
    if (opts.strict !== ENFORCED_OPTIONS.strict) {
        errors.push(`${y(`"strict"`)} must be ${y(`true`)}`);
    }
    if (opts.target !== ENFORCED_OPTIONS.target) {
    }
    if (opts.module !== ENFORCED_OPTIONS.module) {
        errors.push(`${y(`"module"`)} must be ${y(`commonjs`)}`);
    }
    if (opts.moduleDetection !== ENFORCED_OPTIONS.moduleDetection) {
        errors.push(`${y(`"moduleDetection"`)} must be ${y(`"force"`)}`);
    }
    if (opts.moduleResolution !== ENFORCED_OPTIONS.moduleResolution) {
        errors.push(`${y(`"moduleResolution"`)} must be ${y(`"Node"`)}`);
    }
    if (opts.allowSyntheticDefaultImports !== ENFORCED_OPTIONS.allowSyntheticDefaultImports) {
        errors.push(`${y(`"allowSyntheticDefaultImports"`)} must be ${y(`true`)}`);
    }
    const rbxtsModules = path_1.default.join(projectPath, constants_1.NODE_MODULES, constants_1.RBXTS_SCOPE);
    if (opts.typeRoots === undefined || !validateTypeRoots(rbxtsModules, opts.typeRoots)) {
        errors.push(`${y(`"typeRoots"`)} must contain ${y(rbxtsModules)}`);
    }
    for (const typesLocation of (_a = opts.types) !== null && _a !== void 0 ? _a : []) {
        const typeRoots = (_b = opts.typeRoots) !== null && _b !== void 0 ? _b : ["node_modules/@rbxts"];
        if (!typeRoots.some(typeRoot => {
            const typesPath = path_1.default.resolve(projectPath, typeRoot, typesLocation);
            return fs_1.default.existsSync(typesPath) || fs_1.default.existsSync(typesPath + constants_1.DTS_EXT);
        })) {
            errors.push(`${y(`"types"`)} ${y(typesLocation)} were not found. Make sure the path is relative to \`typeRoots\``);
        }
    }
    if (opts.rootDir === undefined && opts.rootDirs === undefined) {
        errors.push(`${y(`"rootDir"`)} or ${y(`"rootDirs"`)} must be defined`);
    }
    if (opts.outDir === undefined) {
        errors.push(`${y(`"outDir"`)} must be defined`);
    }
    if (opts.importsNotUsedAsValues !== undefined) {
        const suggestedValue = opts.importsNotUsedAsValues === typescript_1.default.ImportsNotUsedAsValues.Preserve ? "true" : "false";
        errors.push(`${y(`"importsNotUsedAsValues"`)} is no longer supported, use ${y(`"verbatimModuleSyntax": ${suggestedValue}`)} instead`);
    }
    if (errors.length > 0) {
        throw new ProjectError_1.ProjectError([
            `Invalid "tsconfig.json" configuration!`,
            `https://roblox-ts.com/docs/quick-start#project-folder-setup`,
            errors.map(e => `- ${e}\n`).join(""),
        ].join("\n"));
    }
}
//# sourceMappingURL=validateCompilerOptions.js.map