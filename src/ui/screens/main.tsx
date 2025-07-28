import React, { useEffect, useState } from "@rbxts/react"
import { StartScreen } from "./start-screen"
import { RenderConfigScreen } from "./render-config-screen"
import { Screens } from "ui/constants"
import uiConstants from "ui/ui-constants"
import { RenderProgressScreen } from "./rendering-progress-screen"
import { ErrorScreen } from "./error-screen"
import { AdvancedConfigScreen } from "./advanced-config-screen"
import { Draggers } from "ui/draggers"
import { getCurrentRender, getElementsFromSettings } from "ui/config-helper"

export interface ProgressUpdateData {
    currentProgess: number
    currentStatusText: string
}

export interface ProgressUpdateHooks {
    setCurrentProgress: React.Dispatch<React.SetStateAction<number>>
    setCurrentStatusText: (status: string) => void
    renderComplete: () => void
    errorOccured: (errMsg: string) => void
}

export function Main() {
    const [selectedScreen, setSelectedScreen] = useState(Screens.Home)

    const changeScreen = (screen: Screens) => {
        setSelectedScreen(screen)
    }

    const [currentProgess, setCurrentProgress] = useState(0)
    const [currentStatusText, setCurrentStatusText] = useState("")
    const [currentErrorText, setCurrentErrorText] = useState("")
    const [draggerMode, setDraggerMode] = useState<"Resize" | "Movement">(
        "Movement"
    )

    const renderComplete = () => {
        task.wait(5)
        changeScreen(Screens.Configuration)
    }

    const errorOccured = (errMsg: string) => {
        changeScreen(Screens.Error)
        setCurrentErrorText(errMsg)
    }

    const progressUpdateHooks: ProgressUpdateHooks = {
        setCurrentProgress,
        setCurrentStatusText: (input: string) => {
            setCurrentStatusText(input)
            task.wait()
        },
        renderComplete,
        errorOccured
    }

    const progressUpdateData: ProgressUpdateData = {
        currentProgess,
        currentStatusText
    }

    const switchDragger = () => {
        if (draggerMode.match("Movement").size() > 0) {
            setDraggerMode("Resize")
        } else if (draggerMode.match("Resize").size() > 0) {
            setDraggerMode("Movement")
        }
    }

    const [pluginDebuggingEnabled, setPluginDebuggingEnabled] = useState(true)

    useEffect(() => {
        try {
            const actor = new Instance("Actor")
            actor.Parent = script.Parent
            actor.SendMessage("Testing")
        } catch (e) {
            setPluginDebuggingEnabled(false)
        }
    }, [])

    const renderedScreen = () => {
        switch (selectedScreen) {
            case Screens.Home:
                return (
                    <StartScreen
                        changeScreen={changeScreen}
                        errorMessage={errorOccured}
                    />
                )
            case Screens.Configuration:
                return (
                    <RenderConfigScreen
                        changeScreen={changeScreen}
                        progressHooks={progressUpdateHooks}
                        errorOccured={errorOccured}
                        switchDragger={switchDragger}
                        draggerMode={draggerMode}
                    />
                )
            case Screens.Rendering:
                return (
                    <RenderProgressScreen
                        changeScreen={changeScreen}
                        progressData={progressUpdateData}
                    />
                )
            case Screens.Error:
                return (
                    <ErrorScreen
                        changeScreen={changeScreen}
                        errorText={currentErrorText}
                    />
                )
            case Screens.AdvancedConfig:
                return <AdvancedConfigScreen changeScreen={changeScreen} />
        }
    }

    const settings = getCurrentRender()
    let [BoxCFrame, setBoxCFrame] = useState(new CFrame())
    let [BoxSize, setBoxSize] = useState(new Vector3(30, 20, 30))
    let Box: BlockMesh
    let Center: BasePart

    if (settings) {
        const { center, mesh } = getElementsFromSettings(settings)
        Box = mesh
        Center = center

        if (center.CFrame !== BoxCFrame) setBoxCFrame(center.CFrame)
        if (mesh.Scale !== BoxSize) setBoxSize(mesh.Scale)
    }

    return (
        <frame
            Size={UDim2.fromScale(1, 1)}
            BackgroundColor3={uiConstants.groundColor}
        >
            <Draggers
                mode={draggerMode}
                cframe={BoxCFrame}
                size={BoxSize}
                onDrag={(direction, distance: number) => {
                    if (draggerMode.match("Movement").size() > 0) {
                        if (direction === "MinusX") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(-distance, 0, 0)
                            )
                            Center.CFrame = newCFrame
                            return [newCFrame, BoxSize]
                        } else if (direction === "MinusY") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(0, -distance, 0)
                            )
                            Center.CFrame = newCFrame
                            return [newCFrame, BoxSize]
                        } else if (direction === "MinusZ") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(0, 0, -distance)
                            )
                            Center.CFrame = newCFrame
                            return [newCFrame, BoxSize]
                        } else if (direction === "PlusX") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(distance, 0, 0)
                            )
                            Center.CFrame = newCFrame
                            return [newCFrame, BoxSize]
                        } else if (direction === "PlusY") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(0, distance, 0)
                            )
                            Center.CFrame = newCFrame
                            return [newCFrame, BoxSize]
                        } else if (direction === "PlusZ") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(0, 0, distance)
                            )
                            Center.CFrame = newCFrame
                            return [newCFrame, BoxSize]
                        }
                    } else if (draggerMode.match("Resize").size() > 0) {
                        if (direction === "MinusX") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(-distance / 2, 0, 0)
                            )
                            const newSize = BoxSize.add(
                                new Vector3(distance, 0, 0)
                            )
                            Center.CFrame = newCFrame
                            Box.Scale = newSize
                            return [newCFrame, newSize]
                        } else if (direction === "MinusY") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(0, -distance / 2, 0)
                            )
                            const newSize = BoxSize.add(
                                new Vector3(0, distance, 0)
                            )
                            Center.CFrame = newCFrame
                            Box.Scale = newSize
                            return [newCFrame, newSize]
                        } else if (direction === "MinusZ") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(0, 0, -distance / 2)
                            )
                            const newSize = BoxSize.add(
                                new Vector3(0, 0, distance)
                            )
                            Center.CFrame = newCFrame
                            Box.Scale = newSize
                            return [newCFrame, newSize]
                        } else if (direction === "PlusX") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(distance / 2, 0, 0)
                            )
                            const newSize = BoxSize.add(
                                new Vector3(distance, 0, 0)
                            )
                            Center.CFrame = newCFrame
                            Box.Scale = newSize
                            return [newCFrame, newSize]
                        } else if (direction === "PlusY") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(0, distance / 2, 0)
                            )
                            const newSize = BoxSize.add(
                                new Vector3(0, distance, 0)
                            )
                            Center.CFrame = newCFrame
                            Box.Scale = newSize
                            return [newCFrame, newSize]
                        } else if (direction === "PlusZ") {
                            const newCFrame = BoxCFrame.mul(
                                new CFrame(0, 0, distance / 2)
                            )
                            const newSize = BoxSize.add(
                                new Vector3(0, 0, distance)
                            )
                            Center.CFrame = newCFrame
                            Box.Scale = newSize
                            return [newCFrame, newSize]
                        }
                    }
                    return [BoxCFrame, BoxSize]
                }}
                onDragged={() => {
                    setBoxCFrame(Center.CFrame)
                    setBoxSize(Box.Scale)
                }}
                enabled={settings !== undefined}
            ></Draggers>
            {!pluginDebuggingEnabled && (
                <textlabel
                    Size={new UDim2(1, 0, 0, 30)}
                    BackgroundColor3={uiConstants.primaryColor}
                    TextColor3={uiConstants.blackText}
                    Font={uiConstants.lessboldFont}
                    Text={
                        "Ensure (File>Studio Settings>Plugin Debugging Enabled) is enabled to use this plugin."
                    }
                    TextScaled={true}
                />
            )}
            <frame
                Size={new UDim2(1, -50, 1, -50)}
                Position={UDim2.fromScale(0.5, 0.5)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
            >
                {renderedScreen()}
            </frame>
        </frame>
    )
}
