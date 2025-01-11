import React, { useState } from "@rbxts/react";
import uiConstants from "./ui-constants";
import { Button, ButtonType } from "./button";
import { Textarea } from "./text-area";

export function RenderConfigScreen(props: {
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
            }}/>
            <Button label="Detach Configuration" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={() => {
            }}/>
        </frame>
	);
}
