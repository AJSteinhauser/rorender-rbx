import LifecycleHooks from "./LifecycleHooks";
import PlanNode from "./PlanNode";
import TestPlan from "./TestPlan";
import TestResults from "./TestResults";
import TestSession from "./TestSession";

declare const TestRunner: {
	environment: object;

	/**
	 * Runs the given TestPlan and returns a TestResults object representing the
	 * results of the run.
	 */
	runPlan: (plan: TestPlan) => TestResults;

	/**
	 * Run the given test plan node and its descendants, using the given test
	 * session to store all of the results.
	 */
	runPlanNode: (session: TestSession, planNode: PlanNode, lifecycleHooks: LifecycleHooks) => [string, boolean];
};

export = TestRunner;
