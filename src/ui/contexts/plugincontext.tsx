import React from "@rbxts/react";

export interface PluginContext {
    plugin: Plugin;
    Widget: PluginGui | ScreenGui;
    pushMouseIcon: (icon: string) => string;
    popMouseIcon: (id: string) => void;
}

const PluginContext = React.createContext<PluginContext | undefined>(undefined);

export default PluginContext;
