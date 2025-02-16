import uiConstants from './ui-constants';
import React, { useState } from '@rbxts/react';

export function Textarea(props: {
	label: string;
	placeholder: string;
	size: UDim2;
	textChanged: (text: string) => void;
}) {
	return (
		<frame Size={props.size} BackgroundTransparency={1}>
			<uilistlayout
				HorizontalAlignment={Enum.HorizontalAlignment.Left}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={new UDim(0, uiConstants.spacingSmall)}
			/>
			<textlabel
				TextColor3={uiConstants.secondayText}
				BackgroundTransparency={1}
				Font={uiConstants.boldFont}
				Text={props.label}
				Size={UDim2.fromScale(0.5, 0.3)}
				TextSize={uiConstants.fontSizeNormal}
				TextXAlignment={Enum.TextXAlignment.Left}
				AnchorPoint={new Vector2(0.5, 0.5)}
			/>
			<textbox
				BackgroundColor3={uiConstants.cardColor}
				PlaceholderText={props.placeholder}
				PlaceholderColor3={uiConstants.subtleText}
				Font={uiConstants.lessboldFont}
				TextSize={uiConstants.fontSizeNormal}
				TextXAlignment={Enum.TextXAlignment.Left}
                Size={new UDim2(1,0,.7,-5)}
				TextColor3={uiConstants.primaryText}
				TextTruncate={Enum.TextTruncate.AtEnd}
				Text={''}
				Event={{
					InputChanged: (changed, text) => {
						props.textChanged(changed.Text);
					},
					FocusLost: (changed) => {
						props.textChanged(changed.Text);
					},
					InputEnded: (changed, text) => {
						props.textChanged(changed.Text);
					},
					MouseLeave: (changed, text) => {
						props.textChanged(changed.Text);
					},
				}}
            >
                <uipadding
						PaddingBottom={new UDim(0, 7)}
						PaddingLeft={new UDim(0, 7)}
						PaddingRight={new UDim(0, 7)}
						PaddingTop={new UDim(0, 7)}
					/>
				<uistroke
					Thickness={uiConstants.borderSize}
					Color={uiConstants.borderColor}
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				/>
				<uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
			</textbox>
		</frame>
	);
}
