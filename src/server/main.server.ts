import Vide from "@rbxts/vide";
import { Container } from "ui/main-container";

const toolbar = plugin.CreateToolbar("RoRender");
const button = toolbar.CreateButton("RoRender", "", "");
const dockSettings = new DockWidgetPluginGuiInfo(
    Enum.InitialDockState.Left,
    false,
    false,
    200,
    300,
    600,
    800
)

const window = plugin.CreateDockWidgetPluginGui("RoRender", dockSettings)
window.Title = "RoRender V4"
Vide.mount(Container, window)

button.Click.Connect(() => {
    window.Enabled = !window.Enabled
});
