import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../..";
import ts from "typescript";
export declare function transformImplicitClassConstructor(state: TransformState, node: ts.ClassLikeDeclaration, name: luau.AnyIdentifier): luau.List<luau.MethodDeclaration>;
export declare function transformClassConstructor(state: TransformState, node: ts.ConstructorDeclaration & {
    body: ts.Block;
}, name: luau.AnyIdentifier): luau.List<luau.Statement<luau.SyntaxKind>>;
