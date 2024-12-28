import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../../classes/TransformState";
import ts from "typescript";
export declare function transformJsxChildren(state: TransformState, children: ReadonlyArray<ts.JsxChild>): luau.Expression<luau.SyntaxKind>[];
