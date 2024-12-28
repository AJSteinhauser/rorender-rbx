interface Expectation<T> {
	// LINGUISTIC NO-OPS
	/** A linguistic no-op */
	readonly to: Expectation<T> & CustomMatchers;

	/** A linguistic no-op */
	readonly be: Expectation<T> & CustomMatchers;

	/** A linguistic no-op */
	readonly been: Expectation<T> & CustomMatchers;

	/** A linguistic no-op */
	readonly have: Expectation<T> & CustomMatchers;

	/** A linguistic no-op */
	readonly was: Expectation<T> & CustomMatchers;

	/** A linguistic no-op */
	readonly at: Expectation<T> & CustomMatchers;

	// LINGUISTIC OPS
	/** Applies a never operation to the expectation */
	readonly never: Expectation<T> & CustomMatchers;

	// METHODS

	/**
	 * Assert that the expectation value is the given type.
	 * @param typeName The given type
	 * @returns If the assertion passes, returns reference to itself
	 */
	a: (typeName: ReturnType<typeof typeOf>) => Expectation<T>;

	/**
	 * Assert that the expectation value is the given type.
	 * @param typeName The given type
	 * @returns If the assertion passes, returns reference to itself
	 */
	an: (typeName: ReturnType<typeof typeOf>) => Expectation<T>;

	/**
	 * Assert that our expectation value is not `undefined`
	 * @returns If the assertion passes, returns reference to itself
	 */
	ok: () => Expectation<T>;

	/**
	 * Assert that our expectation value is equal to another value
	 * @param otherValue The other value
	 * @returns If the assertion passes, returns reference to itself
	 */
	equal: (otherValue: unknown) => Expectation<T>;

	/**
	 * Assert that our expectation value is equal to another value within some
	 * inclusive limit.
	 * @param otherValue The other value
	 * @param limit The inclusive limit (defaults to 1e-7)
	 * @returns If the assertion passes, returns reference to itself
	 */
	near: (this: Expectation<number>, otherValue: number, limit?: number) => Expectation<T>;

	/**
	 * Assert that our functoid expectation value throws an error when called
	 * @param search If passed, asserts that this substring is included in the error message
	 * @returns If the assertion passes, returns reference to itself
	 */
	throw: (this: Expectation<Callback>, search?: string) => Expectation<T>;
}

interface ExpectationConstructor {
	new <T>(value: T): Expectation<T> & CustomMatchers;
}

declare const Expectation: ExpectationConstructor;
export = Expectation;
