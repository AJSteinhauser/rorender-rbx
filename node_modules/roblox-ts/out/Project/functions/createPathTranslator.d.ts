import { PathTranslator } from "@roblox-ts/path-translator";
import { ProjectData } from "../../Shared/types";
import ts from "typescript";
export declare function createPathTranslator(program: ts.BuilderProgram, data: ProjectData): PathTranslator;
