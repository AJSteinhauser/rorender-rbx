import React, { useState } from "@rbxts/react";
import uiConstants from "./ui-constants";

export enum ButtonType {
    outline,
    filled
}

const getOutlineColor = (buttonType: ButtonType): Color3 => {
    return buttonType === ButtonType.filled ? 
        uiConstants.primaryColor.Lerp(Color3.fromHex("FFFFFF"),.2) :
        uiConstants.primaryColor
}

const getBackgroundColor = (buttonType: ButtonType): Color3 => {
    return buttonType === ButtonType.filled ? 
        uiConstants.primaryColor :
        uiConstants.groundColor
}

export function Button(props: {
    label: string,
    buttonType: ButtonType,
    size: UDim2
    clicked: () => void
}) {
	return (
        <frame
            BackgroundTransparency={1}
            Size={props.size}
        >
            <frame
                Size={new UDim2(1,2,1,2)}
                AnchorPoint={new Vector2(.5,.5)}
                Position={UDim2.fromScale(.5,.5)}
                ZIndex={1}
                BackgroundColor3={getOutlineColor(props.buttonType)}
            >
                <uicorner CornerRadius={new UDim(0,uiConstants.cornerRadius)} />
            </frame>
            <textbutton
                ZIndex={3}
                Size={UDim2.fromScale(1,1)}
                AnchorPoint={new Vector2(.5,.5)}
                Position={UDim2.fromScale(.5,.5)}
                BackgroundColor3={getBackgroundColor(props.buttonType)}
                Text={props.label}
                Font={uiConstants.boldFont}
                TextSize={uiConstants.fontSizeNormal}
                TextColor3={ props.buttonType === ButtonType.filled ? 
                    uiConstants.blackText :
                    uiConstants.primaryColor
                }
                Event={{
                    Activated: props.clicked
                }}
            >
                <uicorner CornerRadius={new UDim(0,uiConstants.cornerRadius)} />
            </textbutton>
        </frame>
	);
}


