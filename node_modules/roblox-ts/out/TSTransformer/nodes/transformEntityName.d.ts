import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../classes/TransformState";
import ts from "typescript";
export declare function transformEntityName(state: TransformState, node: ts.EntityName): luau.Expression<luau.SyntaxKind>;
