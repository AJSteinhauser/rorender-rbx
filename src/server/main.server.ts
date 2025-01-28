import mount from "ui/mount";

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

const dockWindow = plugin.CreateDockWidgetPluginGui("RoRender", dockSettings)
dockWindow.Title = "RoRender V4"

button.Click.Connect(() => {
    dockWindow.Enabled = !dockWindow.Enabled
});

mount(dockWindow)
