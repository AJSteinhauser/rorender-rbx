export declare class PathTranslator {
    readonly rootDir: string;
    readonly outDir: string;
    readonly buildInfoOutputPath: string | undefined;
    readonly declaration: boolean;
    readonly useLuauExtension: boolean;
    constructor(rootDir: string, outDir: string, buildInfoOutputPath: string | undefined, declaration: boolean, useLuauExtension?: boolean);
    private getLuauExt;
    private makeRelativeFactory;
    getOutputPath(filePath: string): string;
    getOutputDeclarationPath(filePath: string): string;
    getOutputTransformedPath(filePath: string): string;
    getInputPaths(filePath: string): string[];
    getImportPath(filePath: string, isNodeModule?: boolean): string;
}
