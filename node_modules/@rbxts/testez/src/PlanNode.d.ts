import TestEnum from "./TestEnum";

interface PlanNode {
	phrase: string;
	type: TestEnum.NodeType;
	modifier: TestEnum.NodeModifier;
	children: Array<PlanNode>;
	callback: () => void | undefined;
	getFullName(): string;
}

export = PlanNode;
