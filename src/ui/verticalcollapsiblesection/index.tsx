import React, { useState } from '@rbxts/react';
import VerticalExpandingList from 'ui/verticalexpandinglist';
import CollapsibleSectionHeader from './collapsiblesectionheader';

type VerticalCollapsibleSectionProps = {
    LayoutOrder?: number;
    ZIndex?: number;
    Padding?: number;
    Indent?: number;
    HeaderText?: string;
    Font?: Enum.Font;
    Collapsed?: boolean;
    OnToggled?: (collapsed: boolean) => void;
    SortOrder?: Enum.SortOrder;
    children?: Array<React.ReactNode> | React.ReactNode[];
    Content?: Array<React.ReactNode> | React.ReactNode[] | undefined;
    TextColor?: Color3;
    ArrowColor?: Color3;
    BorderColor?: Color3;
};

const VerticalCollapsibleSection: React.FC<VerticalCollapsibleSectionProps> = (props) => {
    const [collapsed, setCollapsed] = useState(props.Collapsed ?? false);

    return (
        <VerticalExpandingList LayoutOrder={props.LayoutOrder ?? 0} ZIndex={props.ZIndex ?? 1} Padding={props.Padding}>
            <CollapsibleSectionHeader
                Indent={props.Indent}
                Text={props.HeaderText ?? 'VerticalCollapsibleSection.defaultProps.HeaderText'}
                Font={props.Font}
                TextColor={props.TextColor}
                ArrowColor={props.ArrowColor}
                BorderColor={props.BorderColor}
                Collapsed={collapsed}
                OnToggled={() => {
                    props.OnToggled?.(!collapsed);
                    setCollapsed(!collapsed);
                }}
                Content={props.Content}
            />
            {!collapsed && (
                <VerticalExpandingList
                    Indent={props.Indent}
                    LayoutOrder={1}
                    BorderSizePixel={0}
                    SortOrder={props.SortOrder ?? Enum.SortOrder.LayoutOrder}
                    Padding={props.Padding}
                >
                    {props.children}
                </VerticalExpandingList>
            )}
        </VerticalExpandingList>
    );
};

export default VerticalCollapsibleSection;
