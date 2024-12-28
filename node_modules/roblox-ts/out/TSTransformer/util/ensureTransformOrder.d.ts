import luau from "@roblox-ts/luau-ast";
import { TransformState } from "..";
import ts from "typescript";
export declare function ensureTransformOrder(state: TransformState, nodes: ReadonlyArray<ts.Expression>, transformer?: (state: TransformState, node: ts.Expression) => luau.Expression): Array<luau.Expression>;
export declare function ensureTransformOrder<T extends ts.Node>(state: TransformState, nodes: ReadonlyArray<T>, transformer: (state: TransformState, node: T) => luau.Expression): Array<luau.Expression>;
