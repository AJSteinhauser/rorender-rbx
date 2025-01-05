import { source } from "@rbxts/vide";
import Vide from "@rbxts/vide";

export function Counter() {
	const count = source(0);
	return (
        <textbutton
            Text={() => `counter: ${count()}`}
            Activated={() => count(count() + 1)}
            Size={()=> new UDim2(0,100,0,100)}
        />
	);
}
