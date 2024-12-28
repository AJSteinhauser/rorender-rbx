import Expectation from "./Expectation";
import Reporter from "./Reporters/Reporter";
import RunResults from "./RunResults";
import TestBootstrap from "./TestBootstrap";
import TestEnum from "./TestEnum";
import TestPlan from "./TestPlan";
import TestPlanner from "./TestPlanner";
import TestResults from "./TestResults";
import TestRunner from "./TestRunner";
import TestSession from "./TestSession";

interface TestEZ {
	run(testRoot: Instance, callback: (runResults: RunResults) => void): void;

	Expectation: typeof Expectation;
	TestBootstrap: TestBootstrap;
	TestEnum: TestEnum;
	TestPlan: TestPlan;
	TestPlanner: typeof TestPlanner;
	TestResults: TestResults;
	TestRunner: typeof TestRunner;
	TestSession: TestSession;

	Reporters: {
		TextReporter: Reporter;
		TextReporterQuiet: Reporter;
		TeamCityReporter: Reporter;
	};
}

declare const TestEZ: TestEZ;
export = TestEZ;
