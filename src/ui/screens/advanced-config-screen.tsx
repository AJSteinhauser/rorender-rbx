import React, { useEffect, useRef, useState } from "@rbxts/react"
import { StartScreen } from "./start-screen"
import { RenderConfigScreen } from "./render-config-screen"
import { Screens } from "ui/constants"
import uiConstants from "ui/ui-constants"
import { ProgressUpdateData } from "./main"
import { Button, ButtonType } from "ui/button"
import {
    convertMeshCollisionBoxes,
    convertToIsometric,
    CubeMoveDirection,
    moveRenderBox
} from "ui/config-helper"

export function AdvancedConfigScreen(props: {
    changeScreen: (screen: Screens) => void
}) {
    const scrollingFrameRef = useRef<ScrollingFrame>(undefined!)
    const [needsScroll, setNeedsScroll] = useState(false)

    useEffect(() => {
        const scrollingFrame = scrollingFrameRef.current
        if (!scrollingFrame) return

        const checkScrolling = () => {
            const contentHeight = scrollingFrame.AbsoluteCanvasSize.Y
            const frameHeight = scrollingFrame.AbsoluteSize.Y
            setNeedsScroll(contentHeight > frameHeight)
        }

        const NameToLayoutOrder = () => {
            const children = scrollingFrame.GetChildren()
            children.forEach((child, index) => {
                if (child.IsA("GuiObject")) {
                    child.LayoutOrder = index
                }
            })
        }

        const sizeConnection = scrollingFrame
            .GetPropertyChangedSignal("AbsoluteSize")
            .Connect(checkScrolling)
        const canvasConnection = scrollingFrame
            .GetPropertyChangedSignal("AbsoluteCanvasSize")
            .Connect(checkScrolling)

        // Initial check with a small delay to let the layout calculations complete
        task.delay(0.1, checkScrolling)
        task.delay(0.1, NameToLayoutOrder)

        return () => {
            sizeConnection.Disconnect()
            canvasConnection.Disconnect()
        }
    }, [])

    const backClick = () => {
        props.changeScreen(Screens.Configuration)
    }

    return (
        <scrollingframe
            ref={scrollingFrameRef}
            Size={UDim2.fromScale(1, 1)}
            BackgroundTransparency={1}
            CanvasSize={UDim2.fromScale(1, 0)}
            AutomaticCanvasSize={Enum.AutomaticSize.Y}
            ScrollBarThickness={8}
            ScrollBarImageColor3={uiConstants.borderColor}
            BorderSizePixel={0}
            ScrollingDirection={Enum.ScrollingDirection.Y}
        >
            <uipadding
                PaddingLeft={new UDim(0, 1)}
                PaddingTop={new UDim(0, 10)}
                PaddingBottom={new UDim(0, 10)}
                PaddingRight={new UDim(0, needsScroll ? 14 : 1)}
            />
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                VerticalAlignment={
                    needsScroll
                        ? Enum.VerticalAlignment.Top
                        : Enum.VerticalAlignment.Center
                }
                Padding={new UDim(0, uiConstants.spacingNormal)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            <textlabel
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                Text={"Move Box"}
                Size={new UDim2(1, 0, 0, 15)}
                TextSize={uiConstants.fontSizeNormal}
                TextXAlignment={Enum.TextXAlignment.Left}
                AnchorPoint={new Vector2(0.5, 0.5)}
            />

            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 110)}>
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                    Padding={new UDim(0, uiConstants.spacingNormal)}
                />
                <Button
                    label="Forwards"
                    buttonType={ButtonType.outline}
                    size={new UDim2(0.5, 0, 0, 30)}
                    clicked={() => moveRenderBox(CubeMoveDirection.Forward)}
                />
                <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 30)}>
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                        FillDirection={Enum.FillDirection.Horizontal}
                        Padding={new UDim(0, uiConstants.spacingNormal)}
                    />
                    <Button
                        label="Left"
                        buttonType={ButtonType.outline}
                        size={new UDim2(0.5, -5, 0, 30)}
                        clicked={() => moveRenderBox(CubeMoveDirection.Left)}
                    />
                    <Button
                        label="Right"
                        buttonType={ButtonType.outline}
                        size={new UDim2(0.5, -5, 0, 30)}
                        clicked={() => moveRenderBox(CubeMoveDirection.Right)}
                    />
                </frame>
                <Button
                    label="Backwards"
                    buttonType={ButtonType.outline}
                    size={new UDim2(0.5, 0, 0, 30)}
                    clicked={() => moveRenderBox(CubeMoveDirection.Backward)}
                />
            </frame>
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 5)} />
            <textlabel
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                Text={"Mesh Detail"}
                Size={new UDim2(1, 0, 0, 15)}
                TextSize={uiConstants.fontSizeNormal}
                TextXAlignment={Enum.TextXAlignment.Left}
                AnchorPoint={new Vector2(0.5, 0.5)}
            />
            <Button
                label="Convert Mesh Collision Boxs"
                buttonType={ButtonType.outline}
                size={new UDim2(1, 0, 0, 30)}
                clicked={() => convertMeshCollisionBoxes()}
            />
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 5)} />
            <textlabel
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                Text={"Isometric"}
                Size={new UDim2(1, 0, 0, 15)}
                TextSize={uiConstants.fontSizeNormal}
                TextXAlignment={Enum.TextXAlignment.Left}
                AnchorPoint={new Vector2(0.5, 0.5)}
            />
            <Button
                label="Toggle Isometric"
                buttonType={ButtonType.outline}
                size={new UDim2(1, 0, 0, 30)}
                clicked={() => convertToIsometric()}
            />
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 5)} />
            <Button
                label="Exit Helpers"
                buttonType={ButtonType.filled}
                size={new UDim2(1, 0, 0, 30)}
                clicked={() => backClick()}
            />
        </scrollingframe>
    )
}
