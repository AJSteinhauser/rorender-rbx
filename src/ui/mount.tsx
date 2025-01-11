import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Container } from "./main-container";

export default (window: DockWidgetPluginGui) => {
    const root = createRoot(new Instance("Folder"));
    root.render(<StrictMode>{createPortal(<Container />, window )}</StrictMode>);
    return root
}
