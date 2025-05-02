import React, { useEffect, useState } from "@rbxts/react"
import { getFFlagStatus } from "fflags/fflags"
import { useLocalization } from "shared/localization/useLocalization"
import { Button, ButtonType } from "ui/button"
import { getRenderSettingsFromSelection, loadRender } from "ui/config-helper"
import { Screens } from "ui/constants"
import uiConstants from "ui/ui-constants"

const renderSettings = script.Parent?.Parent?.Parent?.FindFirstChild(
    "RoRenderSettings"
) as ModuleScript
const changeHistoryService = game.GetService("ChangeHistoryService")
const selectionService = game.GetService("Selection")

export function StartScreen(props: {
    changeScreen: (screen: Screens) => void
    errorMessage: (message: string) => void
}) {
    const { locale, translate, setLanguage } = useLocalization()
    const createSettingsModule = () => {
        const settings = renderSettings.Clone()
        settings.Parent = game.Workspace
        changeHistoryService.SetWaypoint("Add Render Settings")
        selectionService.Set([settings])
        return settings
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

    const pluginEarlyReleaseError = () =>
        props.errorMessage(
            "The Early Release plugin has been disabled. To access the latest active version, please visit https://rorender.com/redirects/plugin"
        )

    const pluginDebuggerError = () =>
        props.errorMessage(
            '"Plugin Debugging Enabled" is currently inactive. Please enable it ( File > Studio Settings > Studio > Debugger > Plugin Debugger Enabled or use the top search bar within studio settings) and restart Studio. If the issue persists after enabling, please restart your computer.'
        )

    return (
        <frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                Padding={new UDim(0, uiConstants.spacingNormal)}
            />
            <textlabel
                TextColor3={uiConstants.primaryColor}
                BackgroundTransparency={1}
                Font={Enum.Font.Bangers}
                Text={"RoRender"}
                Size={new UDim2(1, 0, 0, 50)}
                AnchorPoint={new Vector2(0.5, 0.5)}
                TextSize={uiConstants.fontSizeTitle}
            />
            <Button
                label={translate("CreateSettingsModule")}
                buttonType={ButtonType.outline}
                size={new UDim2(1, 0, 0, 30)}
                clicked={() => {
                    if (!pluginDebuggingEnabled) {
                        pluginDebuggerError()
                        return
                    }
                    const renderSettings = createSettingsModule()
                    loadRender(renderSettings)
                    props.changeScreen(Screens.Configuration)
                }}
            />
            <Button
                label={translate("LoadSettingsModule")}
                buttonType={ButtonType.outline}
                size={new UDim2(1, 0, 0, 30)}
                clicked={() => {
                    if (!pluginDebuggingEnabled) {
                        pluginDebuggerError()
                        return
                    }
                    try {
                        const success = getRenderSettingsFromSelection()
                        if (success) {
                            props.changeScreen(Screens.Configuration)
                        } else {
                            props.errorMessage(translate("NoSettingsModule"))
                        }
                    } catch (exception) {}
                }}
            />
            <textlabel
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Text={translate("LoadSettingsModuleInfo")}
                TextSize={uiConstants.fontSizeSmall}
                TextWrap={true}
                Font={uiConstants.lessboldFont}
                TextXAlignment={Enum.TextXAlignment.Left}
                Size={new UDim2(1, 0, 0, 45)}
            />
        </frame>
    )
}
