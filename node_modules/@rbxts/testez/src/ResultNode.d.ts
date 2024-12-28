import PlanNode from "./PlanNode";
import TestEnum from "./TestEnum";

interface ResultNode {
	planNode: PlanNode;
	children: Array<ResultNode>;
	errors: Array<string>;
	status: TestEnum.TestStatus;
}

export = ResultNode;
