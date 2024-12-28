type Context = Map<string, unknown>;

interface ContextConstructor {
	new (parent?: Context): Context;
}

declare const Context: ContextConstructor;
export = Context;
