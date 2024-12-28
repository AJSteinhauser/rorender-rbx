import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../..";
import ts from "typescript";
export declare function transformJsxExpression(state: TransformState, node: ts.JsxExpression): luau.Expression<luau.SyntaxKind>;
