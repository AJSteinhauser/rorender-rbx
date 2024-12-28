import PlanNode from "./PlanNode";

interface LifecycleHooks {
	/** Returns an array of `beforeEach` hooks in FIFO order */
	getBeforeEachHooks(): Array<() => void>;

	/** Returns an array of `afterEach` hooks in FILO order */
	getAfterEachHooks(): Array<() => void>;

	/** Pushes uncalled beforeAll and afterAll hooks back up the stack */
	popHooks(): void;

	pushHooksFrom(planNode: PlanNode): void;

	getPendingBeforeAllHooks(): Array<() => void>;

	getAfterAllHooks(): Array<() => void>;
}

interface LifecycleHooksConstructor {
	new (): LifecycleHooks;
}

declare const LifecycleHooks: LifecycleHooksConstructor;
export = LifecycleHooks;
