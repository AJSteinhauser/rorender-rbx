import { MacroManager } from "./";
export interface TransformServices {
    macroManager: MacroManager;
}
export interface TryUses {
    usesReturn: boolean;
    usesBreak: boolean;
    usesContinue: boolean;
}
