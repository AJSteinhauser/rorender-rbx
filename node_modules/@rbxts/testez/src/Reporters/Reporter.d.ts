import RunResults from "../RunResults";

interface Reporter {
	report: (runResults: RunResults) => void;
}

export = Reporter;
