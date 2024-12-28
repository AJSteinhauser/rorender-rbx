import ts from "typescript";
export interface TsTransformPathsConfig {
    useRootDirs?: boolean;
}
export default function transformer(program: ts.Program, config: TsTransformPathsConfig): (context: ts.TransformationContext) => (sourceFile: ts.SourceFile | ts.Bundle) => ts.SourceFile | ts.Bundle;
