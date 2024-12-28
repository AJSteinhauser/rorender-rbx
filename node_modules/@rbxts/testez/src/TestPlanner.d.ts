import Module from "./Module";
import TestPlan from "./TestPlan";

declare const TestPlanner: {
	createPlan: (specFunctions: Array<Module>, testNamePattern: string, extraEnvironment: object) => TestPlan;
};

export = TestPlanner;
