import React, { useState } from "@rbxts/react"
import { StartScreen } from "./start-screen"
import { RenderConfigScreen } from "./render-config-screen"
import { Screens } from "ui/constants"
import uiConstants from "ui/ui-constants"
import { ProgressUpdateData } from "./main"

export function RenderProgressScreen(props: {
    changeScreen: (screen: Screens) => void
    progressData: ProgressUpdateData
}) {
    return (
        <frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                Padding={new UDim(0, uiConstants.spacingSmall)}
            />
            <textlabel
                TextColor3={uiConstants.primaryColor}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                Text={"Rendering Image..."}
                Size={new UDim2(1, 0, 0, 60)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                TextSize={uiConstants.fontSizeBig}
            />
            <frame
                Size={new UDim2(1, 0, 0, 20)}
                BackgroundColor3={uiConstants.primaryColor}
            >
                <frame
                    Size={new UDim2(1, 2, 1, 2)}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Position={UDim2.fromScale(0.5, 0.5)}
                    BackgroundColor3={uiConstants.primaryColor.Lerp(
                        new Color3(0, 0, 0),
                        0.1
                    )}
                >
                    <uicorner
                        CornerRadius={new UDim(0, uiConstants.cornerRadius)}
                    />
                </frame>
                <frame
                    Size={UDim2.fromScale(1, 1)}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Position={UDim2.fromScale(0.5, 0.5)}
                    BackgroundColor3={uiConstants.groundColor}
                >
                    <frame
                        Size={
                            new UDim2(
                                props.progressData.currentProgess,
                                -2,
                                1,
                                -2
                            )
                        }
                        AnchorPoint={new Vector2(0, 0.5)}
                        Position={new UDim2(0, 1, 0.5, 0)}
                        BackgroundColor3={uiConstants.primaryColor}
                    >
                        <uicorner
                            CornerRadius={new UDim(0, uiConstants.cornerRadius)}
                        />
                    </frame>
                    <uicorner
                        CornerRadius={new UDim(0, uiConstants.cornerRadius)}
                    />
                </frame>
            </frame>
            <textlabel
                TextColor3={uiConstants.primaryColor}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                Text={string.format(
                    "%.0f%%",
                    props.progressData.currentProgess * 100
                )}
                Size={new UDim2(1, 0, 0, 20)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                TextSize={uiConstants.fontSizeNormal}
            />
            <textlabel
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Font={uiConstants.lessboldFont}
                Text={props.progressData.currentStatusText}
                Size={new UDim2(1, 0, 0, 20)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                TextSize={uiConstants.fontSizeSmall}
            />
        </frame>
    )
}
