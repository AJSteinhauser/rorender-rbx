import React, { useState } from "@rbxts/react"
import { Button, ButtonType } from "ui/button"
import {
    getCurrentRender,
    getRenderSettingsFromSelection,
    loadRender
} from "ui/config-helper"
import { Screens } from "ui/constants"
import uiConstants from "ui/ui-constants"

const renderSettings = script.Parent?.Parent?.Parent?.FindFirstChild(
    "RoRenderSettings"
) as ModuleScript
const changeHistoryService = game.GetService("ChangeHistoryService")
const selectionService = game.GetService("Selection")

export function ErrorScreen(props: {
    changeScreen: (screen: Screens) => void
    errorText: string
}) {
    return (
        <frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                Padding={new UDim(0, uiConstants.spacingNormal)}
            />
            <textlabel
                TextColor3={uiConstants.errorText}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                Text={"Error"}
                Size={new UDim2(1, 0, 0, 40)}
                TextScaled={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                AnchorPoint={new Vector2(0.5, 0.5)}
                TextSize={uiConstants.fontSizeBig}
            />
            <frame
                Size={new UDim2(1, 0, 0, 150)}
                BackgroundColor3={uiConstants.cardColor}
                BorderSizePixel={uiConstants.borderSize}
                BorderColor3={uiConstants.borderColor}
            >
                <uicorner
                    CornerRadius={new UDim(0, uiConstants.cornerRadius)}
                />
                <textlabel
                    TextColor3={uiConstants.secondayText}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    TextYAlignment={Enum.TextYAlignment.Top}
                    BackgroundTransparency={1}
                    Text={props.errorText}
                    TextSize={uiConstants.fontSizeNormal}
                    TextWrap={true}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Position={UDim2.fromScale(0.5, 0.5)}
                    Font={uiConstants.lessboldFont}
                    Size={new UDim2(1, -10, 1, -20)}
                />
            </frame>
            <Button
                label="Ok"
                buttonType={ButtonType.filled}
                size={new UDim2(1, 0, 0, 30)}
                clicked={() => {
                    if (getCurrentRender()) {
                        props.changeScreen(Screens.Configuration)
                    } else {
                        props.changeScreen(Screens.Home)
                    }
                }}
            />
        </frame>
    )
}
