import ts from "typescript";
export declare function findConstructor(node: ts.ClassLikeDeclaration): (ts.ConstructorDeclaration & {
    body: ts.Block;
}) | undefined;
