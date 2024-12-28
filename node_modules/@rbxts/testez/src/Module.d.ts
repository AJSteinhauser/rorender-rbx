import PlanNode from "./PlanNode";

interface Module {
	method: () => void;
	path: Array<PlanNode>;
}

export = Module;
