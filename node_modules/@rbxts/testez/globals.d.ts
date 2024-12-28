/// <reference types="@rbxts/types" />

import Expectation from "./src/Expectation";
import Context from "./src/Context";

declare global {
	type CustomMatchers = Record<never, (received: unknown, expected: unknown) => { pass: boolean; message: string }>;
	/**
	 * This function creates a new describe block. These blocks correspond to the things that are being tested.
	 *
	 * Put it blocks inside of describe blocks to describe what behavior should be correct.
	 */
	function describe(phrase: string, callback: (context: Context) => void): void;

	/**
	 * This function creates a new 'it' block.
	 * These blocks correspond to the behaviors that should be expected of the thing you're testing.
	 */
	function it(phrase: string, callback: (context: Context) => void): void;

	/**
	 * These methods are special versions of it that automatically mark the it block as focused or skipped.
	 * They're necessary because FOCUS and SKIP can't be called inside it blocks!
	 */
	function itFOCUS(phrase: string, callback: (context: Context) => void): void;

	/**
	 * These methods are special versions of it that automatically mark the it block as focused or skipped.
	 * They're necessary because FOCUS and SKIP can't be called inside it blocks!
	 */
	function itSKIP(phrase: string, callback: (context: Context) => void): void;

	/**
	 * This function works the same as itSKIP(), except that it logs a warning reminding you of the skip.
	 */
	function itFIXME(phrase: string, callback: () => void): void;

	/**
	 * When called inside a describe block, FOCUS() marks that block as focused.
	 * If there are any focused blocks inside your test tree, only focused blocks will be executed,
	 * and all other tests will be skipped.
	 *
	 * When you're writing a new set of tests as part of a larger codebase,
	 * use FOCUS() while debugging them to reduce the amount of noise you need to scroll through.
	 */
	function FOCUS(): void;

	/**
	 * This function works similarly to FOCUS(), except instead of marking a block as focused,
	 * it will mark a block as skipped, which stops any of the test assertions in the block from being executed.
	 */
	function SKIP(): void;

	/**
	 * This function works the same as SKIP(), except that it logs a warning reminding you of the skip.
	 */
	function FIXME(): void;

	const expect: {
		/**
		 * Creates a new Expectation, used for testing the properties of the given value.
		 */
		<T>(value: T): Expectation<T> & CustomMatchers;
		/**
		 * Adds a custom matcher
		 */
		extend(matchers: Partial<CustomMatchers>): void;
	};

	/**
	 * Returns a function after all the tests within its scope run. This is useful if you want to clean up some global state that is used by other tests within its scope.
	 */
	function afterAll(callback: (context: Context) => void): void;

	/**
	 * Returns a function after each of the tests within its scope. This is useful if you want to cleanup some temporary state that is created by each test. It is always ran regardless of if the test failed or not.
	 */
	function afterEach(callback: (context: Context) => void): void;

	/**
	 * Runs a function before any of the tests within its scope run. This is useful if you want to set up state that will be used by other tests within its scope.
	 */
	function beforeAll(callback: (context: Context) => void): void;

	/**
	 * Runs a function before each of the tests within its scope. This is useful if you want to reset global state that will be used by other tests within its scope.
	 */
	function beforeEach(callback: (context: Context) => void): void;
}
