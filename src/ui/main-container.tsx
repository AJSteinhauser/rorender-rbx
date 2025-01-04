
import { source } from "@rbxts/vide";

function Counter() {
	const count = source(0);

	return (
		<textbutton
			Text={() => `count: ${count()}`}
			TextChanged={(text) => print(text)}
			Activated={() => count(count() + 1)}
		/>
	);
}
