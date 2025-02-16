import React from "@rbxts/react";
import uiConstants from "./ui-constants";

interface VerticalExpandingListProps {
    LayoutOrder?: number;
    ZIndex?: number;
    BackgroundTransparency?: number;
    BorderSizePixel?: number;
    SortOrder?: Enum.SortOrder;
    Padding?: number;
    Indent?: number;
    setsize?: (size: Vector2) => void;
    children?: Array<React.ReactNode> | React.ReactNode[];
}

const theme = settings().Studio.Theme;

function VerticalExpandingList(props: VerticalExpandingListProps) {
    const [contentSize, setContentSize] = React.useBinding(new Vector2(0, 0));

    return (
        <frame
            LayoutOrder={props.LayoutOrder ?? 0}
            ZIndex={props.ZIndex ?? 1}
            AnchorPoint={new Vector2(0, 0)}
            Position={new UDim2(0, 0, 0, 0)}
            Size={contentSize.map((size: Vector2) =>
                new UDim2(1, 0, 0, size.Y + (props.BorderSizePixel ?? 0) * 2),
            )}
            BackgroundTransparency={props.BackgroundTransparency ?? 0}
            BackgroundColor3={uiConstants.groundColor}
            BorderSizePixel={props.BorderSizePixel ?? 0}
            BorderColor3={uiConstants.primaryColor}
            BorderMode={Enum.BorderMode.Inset}
        >
            <uilistlayout
                SortOrder={props.SortOrder ?? Enum.SortOrder.LayoutOrder}
                FillDirection={Enum.FillDirection.Vertical}
                Padding={new UDim(0, props.Padding ?? 0)}
                Change={{
                    AbsoluteContentSize: (rbx) => {
                        setContentSize(rbx.AbsoluteContentSize);
                        if (props.setsize) {
                            props.setsize(rbx.AbsoluteContentSize);
                        }
                    }
                }}
            />
            <uipadding
                    PaddingLeft={new UDim(0, props.Indent ? 4 + 20 * math.clamp(props.Indent, 1, 99999) : 0)}
                />
            <React.Fragment>{props.children}</React.Fragment>
        </frame>
    );
}

export default VerticalExpandingList;