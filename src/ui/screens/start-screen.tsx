import React, { useEffect, useState } from "@rbxts/react";
import { Button, ButtonType } from "ui/button";
import { getRenderSettingsFromSelection, loadRender } from "ui/config-helper";
import { Screens } from "ui/constants";
import uiConstants from "ui/ui-constants";

const renderSettings = script.Parent?.Parent?.Parent?.FindFirstChild("RoRenderSettings") as ModuleScript
const changeHistoryService = game.GetService("ChangeHistoryService")
const selectionService = game.GetService("Selection")

export function StartScreen(props: {
    changeScreen: (screen: Screens) => void
    errorMessage: (message: string) => void
}) {
    const createSettingsModule = () => {
        const settings = renderSettings.Clone()
        settings.Parent = game.Workspace
        changeHistoryService.SetWaypoint("Add Render Settings")
        selectionService.Set([settings])
        return settings
    }

    useEffect(() => {
        try {
            const actor = new Instance("Actor")
            actor.Parent = script.Parent
            actor.SendMessage("Testing")
        }
        catch(e) {
            props.errorMessage("\"Plugin Debugging Enabled\" is currently inactive. Please enable it and restart Studio. If the issue persists, restart your computer." )
        }
    }, [])

	return (
        <frame
            Size={UDim2.fromScale(1,1)}
            BackgroundTransparency={1}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                Padding={new UDim(0,uiConstants.spacingNormal)}
            />
            <textlabel
                TextColor3={uiConstants.primaryColor}
                BackgroundTransparency={1}
                Font={Enum.Font.Bangers}
                Text={"RoRender"}
                Size={new UDim2(1,0,0,50)}
                AnchorPoint={new Vector2(.5, .5)}
                TextSize={uiConstants.fontSizeTitle}
            />
            <Button label="Create Settings Module" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={() => {
                const renderSettings = createSettingsModule()
                loadRender(renderSettings)
                props.changeScreen(Screens.Configuration)
            }}/>
            <Button label="Load Settings Module" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={() =>{
                try {
                    const success = getRenderSettingsFromSelection()
                    if (success){ 
                        props.changeScreen(Screens.Configuration)
                    }
                    else {
                        props.errorMessage("No configuration found (in the workspace). Consider creating a new RenderSettings Module or manually selecting the SettingsModule")
                    }
                }
                catch(exception) {
                }
            }}/>
            <textlabel
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Text={"To load a previous configuration, select the module in the workspace first, then click \"Load Settings Module\""}
                TextSize={uiConstants.fontSizeSmall}
                TextWrap={true}
                Font={uiConstants.lessboldFont}
                TextXAlignment={Enum.TextXAlignment.Left}
                Size={new UDim2(1,0,0,45)}
            />
        </frame>
	);
}
