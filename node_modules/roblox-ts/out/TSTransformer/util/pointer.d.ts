import luau from "@roblox-ts/luau-ast";
import { TransformState } from "..";
export interface Pointer<T> {
    name: string;
    value: T;
}
export type MapPointer = Pointer<luau.Map | luau.TemporaryIdentifier>;
export type ArrayPointer = Pointer<luau.Array | luau.TemporaryIdentifier>;
export declare function createMapPointer(name: string): MapPointer;
export declare function createArrayPointer(name: string): ArrayPointer;
export declare function assignToMapPointer(state: TransformState, ptr: Pointer<luau.Map | luau.AnyIdentifier>, left: luau.Expression, right: luau.Expression): void;
export declare function disableMapInline(state: TransformState, ptr: MapPointer): asserts ptr is Pointer<luau.TemporaryIdentifier>;
export declare function disableArrayInline(state: TransformState, ptr: ArrayPointer): asserts ptr is Pointer<luau.TemporaryIdentifier>;
