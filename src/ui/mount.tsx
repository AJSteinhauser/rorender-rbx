import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Main } from "./screens/main";

export default (window: DockWidgetPluginGui) => {
    const root = createRoot(new Instance("Folder"));
    root.render(<StrictMode>{createPortal(<Main/>, window )}</StrictMode>);
    return root
}
