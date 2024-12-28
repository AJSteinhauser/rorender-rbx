export declare function createReadBuildProgramHost(): {
    getCurrentDirectory: () => string;
    readFile: (path: string, encoding?: string) => string | undefined;
    useCaseSensitiveFileNames: () => boolean;
};
