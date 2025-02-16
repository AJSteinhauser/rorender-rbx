import React from "@rbxts/react";
import PluginContext, { PluginContext as PluginContextType } from "ui/contexts/plugincontext";

function usePlugin(): PluginContextType | undefined {
    return React.useContext(PluginContext);
}

export default usePlugin;
