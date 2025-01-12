import React, { useState } from "@rbxts/react";
import { runRender } from "server/render-runner";
import { Settings } from "shared/settings/settings.model";
import { Button, ButtonType } from "ui/button";
import { getCurrentRender, QuickSelect, QuickSelectModule, unloadRender } from "ui/config-helper";
import { Screens } from "ui/constants";
import { Textarea } from "ui/text-area";
import uiConstants from "ui/ui-constants";

function isUUIDv4(input: string): boolean {
    return input.match("^%x%x%x%x%x%x%x%x%-%x%x%x%x%-4%x%x%x%-[89abAB]%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$").size() > 0
}

export function RenderConfigScreen(props: {
    changeScreen: (screen: Screens) => void
}) {
    const [renderId, setRenderId] = useState<undefined | string>(undefined)

    const validateUUID = (id: string | undefined): boolean => {
        if (!id){
            return false
        }
        return isUUIDv4(id)
    }

    const textChanged = (text: string) => {
        setRenderId(text)
    }

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

            <textlabel
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                Text={"Quick Select"}
                Size={new UDim2(1,0,0,15)}
                TextSize={uiConstants.fontSizeNormal}
                TextXAlignment={Enum.TextXAlignment.Left}
                AnchorPoint={new Vector2(.5, .5)}
                TextScaled={true}
            />
            <frame
                BackgroundTransparency={1}
                Size={new UDim2(1,0,0,70)}
            >
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                    Padding={new UDim(0,uiConstants.spacingNormal)}
                />
                <frame
                    BackgroundTransparency={1}
                    Size={new UDim2(1,0,0,30)}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                        FillDirection={Enum.FillDirection.Horizontal}
                        Padding={new UDim(0,uiConstants.spacingNormal)}
                    />
                    <Button label="C0" buttonType={ButtonType.outline} size={new UDim2(.5,-5,0,30)} clicked={() => QuickSelectModule(QuickSelect.C0)} />
                    <Button label="C1" buttonType={ButtonType.outline} size={new UDim2(.5,-5,0,30)} clicked={() => QuickSelectModule(QuickSelect.C1)} />
                </frame>
                <Button label="Module" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={() => QuickSelectModule(QuickSelect.Module)} />
            </frame>
            <frame
                BackgroundTransparency={1}
                Size={new UDim2(1,0,0,50)}
            >
            </frame>

            <Textarea label="Render Id" placeholder="Paste the render id here" size={new UDim2(1,0,0,50)} textChanged={textChanged}/>
            <Button label="Start Render" buttonType={ButtonType.filled} size={new UDim2(1,0,0,30)} clicked={() => {
                if (validateUUID(renderId)){
                    runRender(require((getCurrentRender() as ModuleScript).Clone()) as Settings, renderId as string)
                }
            }}/>
            <Button label="Detach Configuration" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={() => {
                unloadRender()
                props.changeScreen(Screens.Home)
            }}/>
        </frame>
	);
}
