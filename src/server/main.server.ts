import mount from "ui/mount"
const Name = "RoRender V4"
const toolbar = plugin.CreateToolbar(Name)
const button = toolbar.CreateButton(
    Name,
    "Open/Close RoRender UI",
    "rbxassetid://75392948701753"
)
const dockSettings = new DockWidgetPluginGuiInfo(
    Enum.InitialDockState.Left,
    false,
    false,
    200,
    300,
    600,
    800
)

const dockSettingsPreview = new DockWidgetPluginGuiInfo(
    Enum.InitialDockState.Float,
    false,
    true,
    500,
    500,
    500,
    500
)

const dockWindow = plugin.CreateDockWidgetPluginGui(Name, dockSettings)
dockWindow.Name = Name
dockWindow.Title = Name

const dockWindowPreview = plugin.CreateDockWidgetPluginGui(
    `${Name} Preview`,
    dockSettingsPreview
)
dockWindowPreview.Name = `${Name} Preview`
dockWindowPreview.Title = `${Name} Preview`

button.Click.Connect(() => {
    dockWindow.Enabled = !dockWindow.Enabled
})

mount(dockWindow)
