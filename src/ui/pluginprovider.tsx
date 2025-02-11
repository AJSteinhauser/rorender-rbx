import React from "@rbxts/react";
import PluginContext, { PluginContext as PluginContextType } from "./contexts/plugincontext";

const HttpService =game.GetService("HttpService")

interface IconStackEntry {
    id: string;
    icon: string;
}

interface PluginProviderProps {
    Plugin: Plugin;
    Widget: PluginGui | ScreenGui;
    children: React.ReactNode | React.ReactNode[];
}

function PluginProvider(props: PluginProviderProps) {
    const { Plugin: plugin, Widget, children } = props;
    const iconStack = React.useRef<IconStackEntry[]>([]);

    const updateMouseIcon = () => {
        const top = iconStack.current[iconStack.current.size() - 1];
        plugin.GetMouse().Icon = top ? top.icon : "";
    };

    const pushMouseIcon = (icon: string) => {
        const id = HttpService.GenerateGUID(false);
        iconStack.current.push({ id, icon });
        updateMouseIcon();
        return id;
    };

    const popMouseIcon = (id: string) => {
        for (let i = iconStack.current.size() - 1; i >= 0; i--) {
            if (iconStack.current[i].id === id) {
                iconStack.current.remove(i);
                break;
            }
        }
        updateMouseIcon();
    };

    React.useEffect(() => {
        return () => {
            iconStack.current.clear();
            plugin.GetMouse().Icon = "";
        };
    }, []);

    return (
        <PluginContext.Provider value={{ plugin, Widget, pushMouseIcon, popMouseIcon }}>
            {children}
        </PluginContext.Provider>
    );
}

export default PluginProvider;
