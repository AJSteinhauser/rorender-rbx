import PlanNode from "./PlanNode";
import ResultNode from "./ResultNode";
import TestPlan from "./TestPlan";

/**
 * Represents a tree of test results.
 *
 * Each node in the tree corresponds directly to a node in a corresponding
 * TestPlan, accessible via the 'planNode' field.
 *
 * TestResults objects are produced by TestRunner using TestSession as state.
 */
interface TestResults {
	/** Visit all test result nodes, depth-first. */
	visitAllNodes(callback: (resultNode: ResultNode) => void, root: ResultNode): void;

	/** Creates a debug visualization of the test results. */
	visualize(root: ResultNode, level: number): string;
}

interface TestResultsConstructor {
	/** Create a new TestResults tree that's linked to the given TestPlan. */
	new (plan: TestPlan): TestResults;

	/** Create a new result node that can be inserted into a TestResult tree. */
	createNode(self: void, planNode: PlanNode): ResultNode;
}

declare const TestResults: TestResultsConstructor;
export = TestResults;
