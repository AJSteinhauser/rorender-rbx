const toolbar = plugin.CreateToolbar("RoRender");
const button = toolbar.CreateButton("RoRender", "", "");

button.Click.Connect(() => {
	print("Button clicked!");
});
