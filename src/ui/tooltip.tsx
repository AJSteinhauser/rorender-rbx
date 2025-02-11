import { getTextSize } from "shared/utils";
import usePlugin from "./hooks/useplugin";
import React from "@rbxts/react";
import uiConstants from "./ui-constants";
import ShowOnTop from "./showontop";

const RunService = game.GetService("RunService")

interface TooltipProps {
    Text: string;
    Enabled?: boolean;
    Priority?: number;
    MaxWidth?: number;
    Size?: UDim2;
    Position?: UDim2;
    AnchorPoint?: Vector2;
    offset?: Vector2;
    TextXAlignment?: Enum.TextXAlignment;
}

function Tooltip(props: TooltipProps) {
    const pdata = usePlugin();

    const [showTooltip, setShowTooltip] = React.useState(false);
    const [mousePosition, setMousePosition] = React.useState<Vector2 | undefined>(undefined);
    const [isTooltipHovered, setTooltipHovered] = React.useState(false);
    let [elapsedTime, setElapsedTime] = React.useState(0);

    const hoverConnectionRef = React.useRef<RBXScriptConnection | undefined>();

    const getShowDelay = () => 0.3/2; // Tooltip display delay in seconds

    const maybeHideTooltip = () => {
        if (!mousePosition || !isTooltipHovered) {
            hoverConnectionRef.current?.Disconnect();
            hoverConnectionRef.current = undefined;
            setShowTooltip(false);
        }
    };

    const connectHover = () => {
        hoverConnectionRef.current?.Disconnect();

        elapsedTime = 0

        hoverConnectionRef.current = RunService.Heartbeat.Connect((deltaTime) => {
            elapsedTime += deltaTime
            if (elapsedTime >= getShowDelay()) {
                hoverConnectionRef.current?.Disconnect();
                hoverConnectionRef.current = undefined;
                setShowTooltip(true);
            }
        });
    };

    const mouseEnter = (_: GuiObject, xpos: number, ypos: number) => {
        if (!isTooltipHovered) {
            setMousePosition(new Vector2(xpos, ypos));
            connectHover();
        }
    };

    const mouseMoved = (_: GuiObject, xpos: number, ypos: number) => {
        setMousePosition(new Vector2(xpos, ypos));
    };

    const mouseLeave = () => {
        setMousePosition(undefined);
        maybeHideTooltip();
    };

    React.useEffect(() => {
        return () => {
            hoverConnectionRef.current?.Disconnect();
        };
    }, []);

    // Tooltip positioning and layout
    const padding = 5;
    const offset = props.offset || new Vector2(4, 17);
    const maxWidth = props.MaxWidth ?? 200;
    const text = props.Text;
    const enabled = props.Enabled !== undefined ? props.Enabled : true;
    const priority = props.Priority;
    const pluginGui = pdata?.Widget;
    const content: Record<string, React.Element> = {};

    if (showTooltip && mousePosition && enabled && pluginGui) {
        let targetX = mousePosition.X + offset.X;
        let targetY = mousePosition.Y + offset.Y;

        const pluginGuiWidth = pluginGui.AbsoluteSize.X;
        const pluginGuiHeight = pluginGui.AbsoluteSize.Y;
        const paddingSize = (0 + padding) * 2;

        const maxRequestedWidth = math.min(pluginGuiWidth, maxWidth);
        const maxAvailableWidth = math.max(0, maxRequestedWidth - paddingSize);

        const textBound = getTextSize(text, new Vector2(maxAvailableWidth, math.huge));
        const AnchorPointBound: Vector2 = new Vector2(textBound.X * (props.AnchorPoint ? props.AnchorPoint.X : 0), textBound.Y * (props.AnchorPoint ? props.AnchorPoint.Y : 0))
        const tooltipTargetWidth = textBound.X + paddingSize + 1;
        const tooltipTargetHeight = textBound.Y + paddingSize - 2;

        if (targetX + tooltipTargetWidth - AnchorPointBound.X >= pluginGuiWidth) {
            targetX = pluginGuiWidth - tooltipTargetWidth + AnchorPointBound.X;
        }
        if (targetY + tooltipTargetHeight - AnchorPointBound.Y >= pluginGuiHeight) {
            targetY = pluginGuiHeight - tooltipTargetHeight + AnchorPointBound.Y;
        }

        const tooltipProps = {
            BackgroundTransparency: 0,
            BorderSizePixel: 0,
            BackgroundColor3: uiConstants.tooltipColor,
            AnchorPoint: props.AnchorPoint,
            Position: new UDim2(0, targetX, 0, targetY),
            Size: new UDim2(0, tooltipTargetWidth, 0, tooltipTargetHeight),
        };

        content.TooltipContainer = (
            <ShowOnTop Priority={priority} target={pluginGui}>
                <frame {...tooltipProps}>
                    <textlabel
                        Size={new UDim2(1, -4, 1, -4)}
                        Position={UDim2.fromScale(.5, .5)}
                        AnchorPoint={new Vector2(.5, .5)}
                        Text={text}
                        TextWrapped={true}
                        BackgroundTransparency={1}
                        Font={uiConstants.boldFont}
                        TextSize={uiConstants.fontSizeNormal}
                        TextColor3={uiConstants.primaryText}
                        TextXAlignment={props.TextXAlignment}
                    />
                    <uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
                </frame>
            </ShowOnTop>
        );
    }

    return (
        <frame
            Size={props.Size ?? new UDim2(1, 0, 1, 0)}
            Position={props.Position}
            BackgroundTransparency={1}
            Event={{
                MouseEnter: mouseEnter,
                MouseMoved: mouseMoved,
                MouseLeave: mouseLeave,
            }}
        >
            {content}
        </frame>
    );
}

export default Tooltip;
