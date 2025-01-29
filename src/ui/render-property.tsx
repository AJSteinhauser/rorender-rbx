import uiConstants from "./ui-constants";
import React, { useState } from "@rbxts/react";

export function RenderProperty(props: {
    size: UDim2,
    property: string,
    value: string
}) {
	return (
        <frame
            Size={props.size}
            BackgroundTransparency={1}
        >
            <uilistlayout
                HorizontalFlex={Enum.UIFlexAlignment.SpaceBetween}
                FillDirection={Enum.FillDirection.Horizontal}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <textlabel
                TextSize={uiConstants.fontSizeNormal}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                TextColor3={uiConstants.primaryColor}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Center}
                Size={UDim2.fromScale(.5,1)}
                Text={props.property + ":"}
            />
            <textlabel
                TextSize={uiConstants.fontSizeNormal}
                Font={uiConstants.lessboldFont}
                BackgroundTransparency={1}
                TextColor3={uiConstants.secondayText}
                TextXAlignment={Enum.TextXAlignment.Right}
                TextYAlignment={Enum.TextYAlignment.Center}
                Size={UDim2.fromScale(.5,1)}
                Text={props.value}
            />
        </frame>
    )
}


