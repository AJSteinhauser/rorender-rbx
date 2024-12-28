import PlanNode from "./PlanNode";
import TestEnum from "./TestEnum";

/**
 * Represents a tree of tests that have been loaded but not necessarily
 * executed yet.
 *
 * TestPlan objects are produced by TestPlanner and TestPlanBuilder.
 */
interface TestPlan {
	/**
	 * Calls the given callback on all nodes in the tree, traversed depth-first.
	 */
	visitAllNodes(callback: (child: PlanNode, level: number) => void, root: PlanNode, level: number): void;

	/**
	 * Visualizes the test plan in a simple format, suitable for debugging the test
	 * plan's structure.
	 */
	visualize(): string;

	/**
	 * Gets a list of all nodes in the tree for which the given callback returns
	 * true.
	 */
	findNodes(callback: (node: PlanNode) => boolean): Array<PlanNode>;
}

interface TestPlanConstructor {
	/** Create a new, empty TestPlan. */
	new (): TestPlan;

	/** Creates a new node that would be suitable to insert into the TestPlan. */
	createNode(self: void, phrase: string, nodeType: TestEnum.NodeType, nodeModifier: TestEnum.NodeModifier): PlanNode;
}

declare const TestPlan: TestPlanConstructor;
export = TestPlan;
