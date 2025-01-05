import { Counter } from "ui/main-container";
import Vide from "@rbxts/vide";

const toolbar = plugin.CreateToolbar("RoRender");
const button = toolbar.CreateButton("RoRender", "", "");
const dockSettings = new DockWidgetPluginGuiInfo(
    Enum.InitialDockState.Left,
    false,
    false,
    200,
    300
)

const window = plugin.CreateDockWidgetPluginGui("RoRender", dockSettings)
window.Title = "RoRender V4"
Vide.mount(Counter, window)

button.Click.Connect(() => {
    window.Enabled = !window.Enabled
});
