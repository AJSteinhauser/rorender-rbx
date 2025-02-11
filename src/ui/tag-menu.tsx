import React, {
	joinBindings,
	useBinding,
	useEffect,
	useRef,
	useState,
} from '@rbxts/react';
import Tooltip from './tooltip';
import { Button, ButtonType } from './button';
import uiConstants from './ui-constants';
import ReactRoblox from '@rbxts/react-roblox';
import { findString, getTextSize } from 'shared/utils';

interface TagMenuProps {
	Size: UDim2;
	Position?: UDim2;
	ImageColor3?: Color3;
	AnchorPoint?: Vector2;
	RowHeight?: number;
	MaxVisibleRows?: number;
	onTagSelected?: (tag: string) => void;
}

const LEFT_TEXT_PAD = 5;
const ARROW_WIDTH = 17;
const CLEAR_BUTTON_WIDTH = 16;
const DEFAULT_MAX_ROWS = 8;

const mouseClickInputs: Record<string, boolean> = {
	[Enum.UserInputType.MouseButton1.Name]: true,
	[Enum.UserInputType.MouseButton2.Name]: true,
	[Enum.UserInputType.MouseButton3.Name]: true,
};

export function TagMenu(props: TagMenuProps) {
	const onTagSelected = props.onTagSelected || function () {};
	const [opened, setOpened] = useState(false);
	const [window, setWindow] = useState<LayerCollector | undefined>(undefined);
	const buttonRef = useRef<ImageButton>(undefined);

	const [searchfilter, setSearchfilter] = useBinding("");
	const [buttonPosBinding, setButtonPosBinding] = useBinding(Vector2.zero);
	const [buttonSizeBinding, setButtonSizeBinding] = useBinding(Vector2.zero);
	const buttonDataBinding = joinBindings({
		Position: buttonPosBinding,
		Size: buttonSizeBinding,
	});

	useEffect(() => {
		const button: GuiButton | undefined = buttonRef.current;
		const connections: Array<RBXScriptConnection> = [];
		if (button) {
			connections[0] = button
				.GetPropertyChangedSignal('AbsolutePosition')
				.Connect(() => {
					setButtonPosBinding(button.AbsolutePosition);
				});
			setButtonPosBinding(button.AbsolutePosition);
			connections[1] = button
				.GetPropertyChangedSignal('AbsoluteSize')
				.Connect(() => {
					setButtonSizeBinding(button.AbsoluteSize);
				});
			setButtonSizeBinding(button.AbsoluteSize);
			connections[2] = button.AncestryChanged.Connect(() => {
				setWindow(button.FindFirstAncestorWhichIsA('LayerCollector'));
			});
			setWindow(button.FindFirstAncestorWhichIsA('LayerCollector'));
		}

		return () => {
			for (const [key, connection] of pairs(connections)) {
				connection.Disconnect();
			}
		};
	}, []);

	useEffect(() => {
		let connection: RBXScriptConnection;
		if (window && window.IsA('PluginGui')) {
			connection = window.WindowFocusReleased.Connect(() => {
				setOpened(false);
			});
		}
		return () => {
			if (connection) connection.Disconnect();
		};
	}, [window]);

	const rowHeight = props.RowHeight || 20;

	let overlay;
	let tagbound: Vector2 | undefined;
	if (window && opened) {
		const items: Record<string, React.ReactNode> = {};
        for (const tag of game.GetService('CollectionService').GetAllTags()) {
			items[tag] = (
				<Button
					size={new UDim2(1, 0, 0, rowHeight)}
					label={tag}
					buttonType={ButtonType.filled}
					textxalignment={Enum.TextXAlignment.Left}
					clicked={() => {
						setOpened(false);
						onTagSelected(tag);
                    }}
                    visible={searchfilter.map((text: string) => {
                        return findString(text, tag)
                    })}
				/>
			);
			const cur = getTextSize(
				tag,
				new Vector2(window.AbsoluteSize.X * 0.7, math.huge)
			);
			if (!tagbound) tagbound = cur;
			if (tagbound && tagbound.X < cur.X) tagbound = cur;
		}

		const maxVisibleRows = props.MaxVisibleRows || DEFAULT_MAX_ROWS;
		const numVisibleRows = math.min(
			game.GetService('CollectionService').GetAllTags().size(),
			maxVisibleRows
		);
		const listHeight = numVisibleRows * rowHeight;
		let dropDirection = 'Down';
		const buttonDataNow = buttonDataBinding.getValue();
		const spaceBelow =
			window.AbsoluteSize.Y - (buttonDataNow.Position.Y + buttonDataNow.Size.Y);
		const spaceAbove = buttonDataNow.Position.Y;
		if (spaceBelow < listHeight && spaceAbove > spaceBelow) {
			dropDirection = 'Up';
		}

		const onOverlayInputBegan = (rbx: Instance, input: InputObject) => {
			if (mouseClickInputs[input.UserInputType.Name]) {
				const buttonData = buttonDataBinding.getValue();
				const areaSize = new Vector2(
					tagbound && tagbound.X > buttonData.Size.X
						? tagbound.X + 50
						: buttonData.Size.X,
					buttonData.Size.Y + listHeight + (dropDirection === 'Down' ? 5 : -5)
				);
				let areaPos = buttonData.Position;
				if (dropDirection === 'Up') {
					areaPos = new Vector2(
						areaPos.X -
							(tagbound && tagbound.X > buttonData.Size.X
								? tagbound.X + 50
								: 0),
						areaPos.Y - listHeight
					);
				} else {
					areaPos = new Vector2(
						areaPos.X -
							(tagbound && tagbound.X > buttonData.Size.X
								? tagbound.X + 50
								: 0),
						areaPos.Y
					);
				}
				const offset = new Vector2(
					input.Position.X - areaPos.X,
					input.Position.Y - areaPos.Y
				);

                if (
					offset.X < 0 ||
					offset.X > areaSize.X ||
					offset.Y < 0 ||
					offset.Y > areaSize.Y
				) {
					setOpened(false);
				}
			} else if (input.UserInputType === Enum.UserInputType.Keyboard) {
				if (input.KeyCode === Enum.KeyCode.Escape) {
					setOpened(false);
				}
			}
        };
        
		overlay = (
			<textbutton
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				Event={{ InputBegan: onOverlayInputBegan }}
				Text={''}
			>
				<frame
					ZIndex={2}
					AnchorPoint={buttonDataBinding.map((data) => {
						let X = 0;
						let Y = dropDirection === 'Down' ? 0 : 1;

						if (data.Position.X > window.AbsoluteSize.Y / 2) {
							X = 1;
						}

						return new Vector2(X, Y);
					})}
					Position={buttonDataBinding.map((data) => {
						let px = math.round(data.Position.X);
						let py = math.round(data.Position.Y);
						if (dropDirection === 'Down') {
							py += math.round(data.Size.Y) + 5;
						} else if (dropDirection === 'Up') {
							py -= 5;
						}
						if (data.Position.X > window.AbsoluteSize.Y / 2) {
							px += math.round(data.Size.X);
						}
						return UDim2.fromOffset(px, py);
					})}
					Size={buttonSizeBinding.map((size) => {
						if (tagbound && tagbound.X > size.X)
							return UDim2.fromOffset(tagbound.X + 50, listHeight);
						else return UDim2.fromOffset(math.round(size.X), listHeight);
					})}
					BackgroundColor3={uiConstants.groundColor}
				>
					<uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
					<uistroke
						Color={uiConstants.primaryColor}
						ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
						Thickness={uiConstants.borderSize}
					/>
					<uipadding
						PaddingBottom={new UDim(0, 5)}
						PaddingLeft={new UDim(0, 5)}
						PaddingRight={new UDim(0, 5)}
						PaddingTop={new UDim(0, 5)}
					/>
					<uilistlayout
						HorizontalAlignment={Enum.HorizontalAlignment.Center}
						VerticalAlignment={Enum.VerticalAlignment.Top}
                        Padding={new UDim(0, uiConstants.spacingSmall)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
					/>
					<textbox
						ZIndex={2}
						LayoutOrder={dropDirection === 'Down' ? 1 : 2}
						TextSize={uiConstants.fontSizeNormal}
						Font={uiConstants.lessboldFont}
						BackgroundTransparency={1}
						TextColor3={uiConstants.secondayText}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextYAlignment={Enum.TextYAlignment.Center}
						Size={new UDim2(1, 0, 0, rowHeight)}
						Text={''}
						ClearTextOnFocus={false}
						Change={{
                            Text: (rbx) => {
                                setSearchfilter(rbx.Text)
                            },
						}}
						PlaceholderText={'Search for a tag'}
						PlaceholderColor3={uiConstants.subtleText}
					>
						<uipadding
							PaddingLeft={new UDim(0, 5)}
							PaddingRight={new UDim(0, 5)}
						/>
						<uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
						<uistroke
							Color={uiConstants.borderColor}
							ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
							Thickness={uiConstants.borderSize}
						/>
					</textbox>
					<scrollingframe
						LayoutOrder={dropDirection === 'Down' ? 2 : 1}
						ZIndex={2}
						Size={new UDim2(1, 0, 1, -(rowHeight + uiConstants.spacingSmall))}
						BackgroundTransparency={1}
						ScrollBarThickness={6}
						BottomImage={'rbxassetid://102005262783337'}
						TopImage={'rbxassetid://102005262783337'}
						MidImage={'rbxassetid://102005262783337'}
						ScrollBarImageColor3={uiConstants.cardColor}
						CanvasSize={new UDim2()}
						AutomaticCanvasSize={Enum.AutomaticSize.Y}
						VerticalScrollBarInset={Enum.ScrollBarInset.ScrollBar}
						HorizontalScrollBarInset={Enum.ScrollBarInset.ScrollBar}
					>
						<uipadding
							PaddingBottom={new UDim(0, 5)}
							PaddingLeft={new UDim(0, 5)}
							PaddingRight={new UDim(0, 5)}
							PaddingTop={new UDim(0, 5)}
						/>
						<uilistlayout
							HorizontalAlignment={Enum.HorizontalAlignment.Center}
							VerticalAlignment={Enum.VerticalAlignment.Top}
							Padding={new UDim(0, uiConstants.spacingSmall)}
						/>
						{items}
					</scrollingframe>
				</frame>
			</textbutton>
		);
	}

	return (
		<imagebutton
			Size={props.Size}
			Image={'rbxassetid://16898788033'}
			ImageColor3={props.ImageColor3}
			ImageRectOffset={new Vector2(0, 257)}
			ImageRectSize={new Vector2(256, 256)}
			BackgroundTransparency={1}
			AnchorPoint={props.AnchorPoint}
			Position={props.Position}
			Event={{
				Activated: () => {
					setOpened(!opened);
				},
			}}
			ref={buttonRef}
		>
			{window && overlay
				? ReactRoblox.createPortal(overlay, window)
				: undefined}
			<Tooltip
				Text="Add Tag"
				AnchorPoint={new Vector2(0.5, 0)}
				offset={new Vector2(0, 17)}
			/>
		</imagebutton>
	);
}

export default TagMenu;
