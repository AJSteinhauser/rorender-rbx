import uiConstants from "./ui-constants";
import React from "@rbxts/react";

export function CheckBox(props: {
    size: UDim2
    label: string
    isChecked: boolean
    onChange: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const invertState = () => props.onChange(!props.isChecked)

	return (
        <frame
            Size={props.size}
            BackgroundTransparency={1}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                FillDirection={Enum.FillDirection.Horizontal}
                Padding={new UDim(0,uiConstants.spacingSmall)}
            />
            <textbutton
                Size={new UDim2(0,20,0,20)}
                BorderSizePixel={uiConstants.borderSize * 2}
                BorderColor3={uiConstants.primaryColor}
                BackgroundColor3={uiConstants.cardColor}
                Text={""}
                AutoButtonColor={false}
                Event={{
                    Activated: invertState
                }}
            >
                <uistroke
                    Thickness={uiConstants.borderSize}
                    Color={uiConstants.primaryColor}
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                />
                <uicorner
                    CornerRadius={new UDim(0,uiConstants.cornerRadius)}
                />
                { props.isChecked &&
                    <textbutton
                        Size={new UDim2(1,-4,1,-4)}
                        AnchorPoint={new Vector2(.5,.5)}
                        Position={UDim2.fromScale(.5,.5)}
                        BorderSizePixel={0}
                        BackgroundColor3={uiConstants.primaryColor}
                        AutoButtonColor={false}
                        Text={""}
                        Event={{
                            Activated: invertState
                        }}
                    >
                        <uicorner
                            CornerRadius={new UDim(0,uiConstants.cornerRadius)}
                        />
                    </textbutton>
                }
            </textbutton>

            <textlabel
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Font={uiConstants.boldFont}
                Text={props.label}
                Size={UDim2.fromScale(.5,1)}
                TextSize={uiConstants.fontSizeNormal}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Center}
                AnchorPoint={new Vector2(.5, .5)}
            >
                <uiflexitem
                    FlexMode={Enum.UIFlexMode.Fill}
                />
            </textlabel>
        </frame>
	);
}
