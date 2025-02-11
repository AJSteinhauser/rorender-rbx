import React from '@rbxts/react';
import BaseLabelledToggle, {
	BaseLabelledToggleConsumerProps,
	BaseLabelledToggleProps,
} from './foundations/baselabelledtoggle';
import uiConstants from './ui-constants';

const INDICATOR_IMAGE_DEFAULT = 'rbxassetid://14890059620';

interface CheckboxProps extends BaseLabelledToggleConsumerProps {
	Value?: boolean;
	Disabled?: boolean;
	BoxSize?: number;
}

function Checkbox(props: CheckboxProps) {
	const mergedProps = { ...props } as BaseLabelledToggleProps;

	mergedProps.RenderButton = (subProps: { Hovered: boolean }) => {
		let indicatorColor = uiConstants.borderColor;
		let backgroundColor = uiConstants.groundColor;
		let indicatorTransparency = 0;
		if (props.Value === undefined) {
			indicatorColor = new Color3(1, 1, 1);
			if (props.Disabled) {
				indicatorTransparency = 0.5;
			}
		}
		if (props.Value === true) {
			indicatorColor = uiConstants.primaryColor;
			backgroundColor = uiConstants.primaryColor;
			indicatorTransparency = 0;
		} else if (subProps.Hovered) {
			indicatorColor = uiConstants.primaryColor;
		} else if (props.Value === false) {
			indicatorColor = uiConstants.borderColor;
			backgroundColor = uiConstants.groundColor;
			indicatorTransparency = 1;
		}

		const size = props.BoxSize ? props.BoxSize : 12;

		return (
			<frame
				// BackgroundColor3={theme.GetColor(Enum.StudioStyleGuideColor.Item, backModifier)}
				// BorderColor3={theme.GetColor(Enum.StudioStyleGuideColor.CheckedFieldBorder, mainModifier)}
				BorderMode={Enum.BorderMode.Inset}
				Size={new UDim2(1, 0, 1, 0)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
			>
				<imagelabel
					Position={new UDim2(0.5, 0, 0.5, 0)}
					AnchorPoint={new Vector2(0.5, 0.5)}
					BackgroundTransparency={0}
					Size={new UDim2(0, size, 0, size)}
					Image={'rbxassetid://16898617411'}
					ImageColor3={uiConstants.groundColor}
					BackgroundColor3={backgroundColor}
					ImageRectOffset={new Vector2(257, 0)}
					ImageRectSize={new Vector2(256, 256)}
					ImageTransparency={indicatorTransparency}
				>
					<uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
					<uistroke
						Color={indicatorColor}
						ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
						Thickness={uiConstants.borderSize}
					/>
				</imagelabel>
			</frame>
		);
	};

	return <BaseLabelledToggle {...mergedProps} />;
}

export default Checkbox;
