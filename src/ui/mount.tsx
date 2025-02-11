import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Main } from "./screens/main";
import PluginProvider from "./pluginprovider";

export default (window: DockWidgetPluginGui, plugin: Plugin) => {
    const root = createRoot(new Instance("Folder"));
    root.render(<StrictMode>{createPortal(<PluginProvider Widget={window} Plugin={plugin}><Main/></PluginProvider>, window )}</StrictMode>);
    return root
}
