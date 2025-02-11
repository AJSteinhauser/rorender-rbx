import React, { useState } from '@rbxts/react';
import uiConstants from 'ui/ui-constants';

interface CollapsibleSectionHeaderProps {
	OnToggled: () => void;
	Collapsed: boolean;
	Indent?: number;
	Font?: Enum.Font;
	TextColor?: Color3;
	ArrowColor?: Color3;
	BorderColor?: Color3;
	Text: string;
	Content?: Array<React.ReactNode> | React.ReactNode[] | undefined;
}

function CollapsibleSectionHeader(props: CollapsibleSectionHeaderProps) {
	const [hovered, setHovered] = React.useBinding(false);

	const onInputBegan = (_: Frame, input: InputObject) => {
		if (input.UserInputType === Enum.UserInputType.MouseButton1) {
			props.OnToggled();
		} else if (input.UserInputType === Enum.UserInputType.MouseMovement) {
			setHovered(true);
		}
	};

	const onInputEnded = (_: Frame, input: InputObject) => {
		if (input.UserInputType === Enum.UserInputType.MouseMovement) {
			setHovered(false);
		}
	};

	const modifier = hovered.getValue()
		? Enum.StudioStyleGuideModifier.Hover
		: Enum.StudioStyleGuideModifier.Default;

	const arrowImage = props.Collapsed
		? 'rbxasset://textures/ManageCollaborators/arrowRight_dark.png'
		: 'rbxasset://textures/ManageCollaborators/arrowDown_dark.png';

	return (
		<frame
			Active={true}
			LayoutOrder={0}
			Size={new UDim2(1, 0, 0, 30)}
			BackgroundTransparency={1}
			Event={{
				InputBegan: onInputBegan,
				InputEnded: onInputEnded,
			}}
		>
			<uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
			<uistroke
				Color={props.BorderColor ?? new Color3(1, 1, 1)}
				ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				Thickness={uiConstants.borderSize}
			/>
			<imagelabel
				AnchorPoint={new Vector2(0, 0.5)}
				Position={
					new UDim2(
						0,
						4 + 20 * (math.clamp(props.Indent ?? 1, 1, 1) - 1),
						0.5,
						0
					)
				}
				Size={new UDim2(0, 16, 0, 16)}
				Image={arrowImage}
				ImageColor3={props.ArrowColor ?? new Color3(1, 1, 1)}
				BackgroundTransparency={1}
			/>
			<textlabel
				TextColor3={props.TextColor ?? uiConstants.primaryText}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Center}
				Font={props.Font ?? uiConstants.boldFont}
				Text={props.Text}
				TextSize={uiConstants.fontSizeNormal}
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
			>
				<uipadding
					PaddingLeft={
						new UDim(0, 4 + 20 * math.clamp(props.Indent ?? 1, 1, 1))
					}
				/>
			</textlabel>
			{props.Content}
		</frame>
	);
}

export default CollapsibleSectionHeader;
