import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";

const FOCUSED_ZINDEX = 1000000;

interface ShowOnTopProps {
    target: Instance;
    Priority?: number;
    children?: React.ReactNode;
}

export function ShowOnTop(props: ShowOnTopProps) {
    const { target, Priority = 0, children } = props;

    const element = (
        <frame
            ZIndex={Priority + FOCUSED_ZINDEX}
            Size={new UDim2(1, 0, 1, 0)}
            BackgroundTransparency={1}
        >
            {children}
        </frame>
    );

    return ReactRoblox.createPortal(element, target);
}

export default ShowOnTop;
