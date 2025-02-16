import mount from "ui/mount";

const toolbar = plugin.CreateToolbar("RoRender V4");
const button = toolbar.CreateButton("RoRender V4", "Open/Close RoRender UI", "rbxassetid://75392948701753");
const dockSettings = new DockWidgetPluginGuiInfo(
    Enum.InitialDockState.Left,
    false,
    false,
    200,
    300,
    600,
    800
)

const dockWindow = plugin.CreateDockWidgetPluginGui("RoRender V4", dockSettings)
dockWindow.Title = "RoRender V4"
dockWindow.Name = "RoRender V4"

button.Click.Connect(() => {
    dockWindow.Enabled = !dockWindow.Enabled
});

mount(dockWindow, plugin)
