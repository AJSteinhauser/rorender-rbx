import React, { useState } from "@rbxts/react";
import uiConstants from "./ui-constants";
import { Textarea } from "./text-area";
import { Button, ButtonType } from "./button";
import { getRenderSettingsFromSelection } from "./canvas-helper";

const renderSettings = script.Parent?.Parent?.FindFirstChild("RoRenderSettings")

export function Container() {
    const createSettingsModule = () => {
        if (!renderSettings){
            return
        }
        const settings = renderSettings.Clone()
        settings.Parent = game.Workspace
    }
	return (
        <frame
            Size={UDim2.fromScale(1,1)}
            BackgroundColor3={uiConstants.groundColor}
        >
            <frame
                Size={new UDim2(1,-100,1,-100)}
                Position={UDim2.fromScale(.5,.5)}
                AnchorPoint={new Vector2(.5,.5)}
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
                    Size={UDim2.fromScale(.5,.15)}
                    AnchorPoint={new Vector2(.5, .5)}
                    TextSize={uiConstants.fontSizeTitle}
                />
                <Textarea label="Render Id" placeholder="Paste the render id here" size={new UDim2(1,0,0,50)}/>
                <Button label="Create Settings Module" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={createSettingsModule}/>
                <Button label="Load Settings Module" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={getRenderSettingsFromSelection}/>
                <Button label="Start Render" buttonType={ButtonType.filled} size={new UDim2(1,0,0,30)} clicked={createSettingsModule}/>
            </frame>
        </frame>
	);
}
