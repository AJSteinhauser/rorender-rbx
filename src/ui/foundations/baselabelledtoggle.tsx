import React from "@rbxts/react";
import uiConstants from "ui/ui-constants";

const DEFAULT_HEIGHT = 20;
const BOX_SIZE = 16;
const INNER_PADDING = 6;

interface T {
	Disabled?: boolean,
	AnchorPoint?: Vector2,
	Position?: UDim2,
	Size?: UDim2,
	LayoutOrder?: number,
	ZIndex?: number
}

export interface BaseLabelledToggleConsumerProps extends T {
    ContentAlignment?: Enum.HorizontalAlignment;
    ButtonAlignment?: Enum.HorizontalAlignment;
    OnChanged?: () => void;
    Label?: string;
    TextColor: Color3;
}

export interface BaseLabelledToggleProps extends BaseLabelledToggleConsumerProps {
    RenderButton?: (props: { Hovered: boolean }) => React.ReactNode | undefined;
}

function BaseLabelledToggle(props: BaseLabelledToggleProps) {
    const [hovered, setHovered] = React.useState(false);

    let mainModifier: Enum.StudioStyleGuideModifier = Enum.StudioStyleGuideModifier.Default;
    if (props.Disabled) {
        mainModifier = Enum.StudioStyleGuideModifier.Disabled;
    } else if (hovered) {
        mainModifier = Enum.StudioStyleGuideModifier.Hover;
    }

    const contentAlignment = props.ContentAlignment ?? Enum.HorizontalAlignment.Left;
    const buttonAlignment = props.ButtonAlignment ?? Enum.HorizontalAlignment.Left;

    const textWidth = props.Label ? 1000 : 0;
    let textAlignment: Enum.TextXAlignment = Enum.TextXAlignment.Left;
    let buttonOrder = 1;
    let labelOrder = 2;

    if (buttonAlignment === Enum.HorizontalAlignment.Right) {
        buttonOrder = 2;
        labelOrder = 1;
        textAlignment = Enum.TextXAlignment.Right;
    }

    const content = props.RenderButton ? props.RenderButton({ Hovered: hovered }) : undefined;

    return (
        <textbutton
            Size={props.Size ?? new UDim2(1, 0, 0, DEFAULT_HEIGHT)}
            Position={props.Position}
            AnchorPoint={props.AnchorPoint}
            LayoutOrder={props.LayoutOrder}
            ZIndex={props.ZIndex}
            BackgroundTransparency={1}
            Text=""
            Event={{
                InputBegan: (_, input) => {
                    if (input.UserInputType === Enum.UserInputType.MouseMovement) {
                        setHovered(true);
                    }
                },
                InputEnded: (_, input) => {
                    if (input.UserInputType === Enum.UserInputType.MouseMovement) {
                        setHovered(false);
                    }
                },
                Activated: () => {
                    if (!props.Disabled && props.OnChanged) {
                        props.OnChanged();
                    }
                },
            }}
        >
            <uilistlayout
                HorizontalAlignment={contentAlignment}
                VerticalAlignment={Enum.VerticalAlignment.Center}
                FillDirection={Enum.FillDirection.Horizontal}
                SortOrder={Enum.SortOrder.LayoutOrder}
                Padding={new UDim(0, INNER_PADDING)}
            />
            <frame BackgroundTransparency={1} Size={new UDim2(0, BOX_SIZE, 0, BOX_SIZE)} LayoutOrder={buttonOrder}>
                {content && <>{content}</>}
            </frame>
            {props.Label !== undefined && (
                <textlabel
                    BackgroundTransparency={1}
                    Size={new UDim2(1, -BOX_SIZE - INNER_PADDING, 1, 0)}
                    TextXAlignment={textAlignment}
                    TextTruncate={Enum.TextTruncate.AtEnd}
                    Text={props.Label}
                    Font={uiConstants.boldFont}
                    TextSize={uiConstants.fontSizeNormal}
                    TextColor3={props.TextColor}
                    LayoutOrder={labelOrder}
                >
                    <uisizeconstraint MaxSize={new Vector2(textWidth, math.huge)} />
                    <uipadding PaddingBottom={new UDim(0, 1)} />
                </textlabel>
            )}
        </textbutton>
    );
}

export default BaseLabelledToggle;
