import Vide from "@rbxts/vide";
import uiConstants from "./ui-constants";

export function Textarea(props: {
    label: string,
    placeholder: string
    size: UDim2
}) {
	return (
        <frame
            Size={props.size}
            BackgroundTransparency={1}
            Name={"Container"}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                Padding={new UDim(0,uiConstants.spacingSmall)}
            />
            <textlabel
                Name={"Title"}
                TextColor3={uiConstants.secondayText}
                BackgroundTransparency={1}
                Font={Enum.Font.SourceSansBold}
                Text={props.label}
                Size={UDim2.fromScale(.5,.3)}
                TextSize={uiConstants.fontSizeNormal}
                TextXAlignment={Enum.TextXAlignment.Left}
                AnchorPoint={new Vector2(.5, .5)}
                TextScaled={true}
            />
            <frame
                Size={new UDim2(1,0,.7,0)}
                BorderSizePixel={uiConstants.borderSize}
                BorderColor3={uiConstants.borderColor}
                BackgroundColor3={uiConstants.cardColor}
            >
                <uicorner
                    CornerRadius={new UDim(0,uiConstants.cornerRadius)}
                />
                <textbox
                    PlaceholderText={props.placeholder}
                    PlaceholderColor3={uiConstants.subtleText}
                    Font={Enum.Font.SourceSansSemibold}
                    TextSize={uiConstants.fontSizeNormal}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    Size={new UDim2(1,-14,1,-14)}
                    Position={UDim2.fromScale(.5,.5)}
                    AnchorPoint={new Vector2(.5,.5)}
                    TextColor3={uiConstants.primaryText}
                    BackgroundTransparency={1}
                    TextTruncate={Enum.TextTruncate.AtEnd}
                />
            </frame>
        </frame>
	);
}

