import React, { useEffect, useState } from "@rbxts/react";
import { runRender } from "server/render-runner";
import { Settings } from "shared/settings/settings.model";
import { Button, ButtonType } from "ui/button";
import { 
    autoConfigureBoundingBox,
    getCurrentRender,
    QuickSelect,
    QuickSelectModule,
    setUpdaters,
    unloadRender,
} from "ui/config-helper";
import { Screens } from "ui/constants";
import { Textarea } from "ui/text-area";
import uiConstants from "ui/ui-constants";
import { ProgressUpdateData, ProgressUpdateHooks } from "./main";
import { RenderProperty } from "ui/render-property";

function isUUIDv4(input: string): boolean {
    return input.match("^%x%x%x%x%x%x%x%x%-%x%x%x%x%-4%x%x%x%-[89abAB]%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$").size() > 0
}

export function RenderConfigScreen(props: {
    changeScreen: (screen: Screens) => void,
    progressHooks: ProgressUpdateHooks
    errorOccured: (message: string) => void
}) {
    const [renderId, setRenderId] = useState<undefined | string>(undefined)
    const [imageSize, setImageSize] = useState<string>("")
    const [scale, setScale] = useState<string>("")
    const [data, setData] = useState<string>("")

    useEffect(() => {
        setUpdaters(setImageSize, setScale, setData)
    }, [])

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
            />
            <frame
                BackgroundTransparency={1}
                Size={new UDim2(1,0,0,110)}
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
                <Button label="Settings Module" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={() => QuickSelectModule(QuickSelect.Module)} />
                <Button label="Auto Configure" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={() => autoConfigureBoundingBox()} />
            </frame>
            <frame
                BackgroundTransparency={1}
                Size={new UDim2(1,0,0,5)}
            />
            <Textarea label="Render Id" placeholder="Paste the render id here" size={new UDim2(1,0,0,60)} textChanged={textChanged}/>
            <Button label="Start Render" buttonType={ButtonType.filled} size={new UDim2(1,0,0,30)} clicked={() => {
                if (validateUUID(renderId)){
                    props.changeScreen(Screens.Rendering)
                    runRender(
                        require((getCurrentRender() as ModuleScript).Clone()) as Settings,
                        renderId as string,
                        props.progressHooks
                    )
                }
                else {
                    props.errorOccured(`${renderId} is not a valid UUID. Use the copy button to ensure the entire UUID is copied into your clipboard.`)
                }
            }}/>
            <Button label="Detach Configuration" buttonType={ButtonType.outline} size={new UDim2(1,0,0,30)} clicked={() => {
                unloadRender()
                props.changeScreen(Screens.Home)
            }}/>
            <textlabel
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                Text={"Stats"}
                Size={new UDim2(1,0,0,15)}
                TextSize={uiConstants.fontSizeNormal}
                TextXAlignment={Enum.TextXAlignment.Left}
                AnchorPoint={new Vector2(.5, .5)}
            />
            <frame
                BackgroundColor3={uiConstants.cardColor}
                Size={new UDim2(1,0,0,85)}
            >
                <uicorner CornerRadius={new UDim(0,uiConstants.cornerRadius)} />
                <frame
                    Size={new UDim2(1,-15, 1, -15)}
                    BackgroundTransparency={1}
                    AnchorPoint={new Vector2(.5,.5)}
                    Position={UDim2.fromScale(.5,.5)}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        VerticalAlignment={Enum.VerticalAlignment.Top}
                        Padding={new UDim(0,uiConstants.spacingSmall)}
                    />
                    <RenderProperty size={new UDim2(1,0,0,20)} property="Image Size" value={imageSize} />
                    <RenderProperty size={new UDim2(1,0,0,20)} property="Scale" value={scale} />
                    <RenderProperty size={new UDim2(1,0,0,20)} property="Raw Data" value={data} />
                </frame>
            </frame>
        </frame>
	);
}
