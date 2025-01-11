import React, { useState } from "@rbxts/react";
import { runRender } from "server/render-runner";
import { render } from "shared/render/render.main";
import { villageSettings } from "shared/settings/settings";
import { Button, ButtonType } from "ui/button";
import { unloadRender } from "ui/config-helper";
import { Screens } from "ui/constants";
import { Textarea } from "ui/text-area";
import uiConstants from "ui/ui-constants";

const studioService = game.GetService("StudioService")

export function RenderConfigScreen(props: {
    changeScreen: (screen: Screens) => void
}) {
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

            <Textarea label="Render Id" placeholder="Paste the render id here" size={new UDim2(1,0,0,50)}/>
            <Button label="Start Render" buttonType={ButtonType.filled} size={new UDim2(1,0,0,30)} clicked={() => {
                runRender(villageSettings)
            }}/>
            <Button label="Detach Configuration" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={() => {
                unloadRender()
                props.changeScreen(Screens.Home)
            }}/>
        </frame>
	);
}
