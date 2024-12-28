interface RunResults {
	errors: ReadonlyArray<string>;
	failureCount: number;
	skippedCount: number;
	successCount: number;
}

export = RunResults;
