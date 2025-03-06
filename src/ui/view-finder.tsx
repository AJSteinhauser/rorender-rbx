import { VIEWFINDER_IMAGE_SIZE } from 'shared/render/render.model';
import { setViewfinderSettings, updateShowWater } from './config-helper';
import uiConstants from './ui-constants';
import React, { useEffect, useRef, useState } from '@rbxts/react';
import { CheckBox } from './checkbox';

const assetService = game.GetService('AssetService');
const pluginGuiService = game.GetService('PluginGuiService');
const popoutPadding = new UDim(0, 3);

export function ViewFinder(props: { size: UDim2 }) {
	const editageImageRef = useRef<EditableImage | undefined>(undefined);
	const contentRef = useRef<Content | undefined>(undefined);
	const finderRef = useRef<Frame>();
	const [showWater, setShowWater] = useState(false);
	const [popout, setPopout] = useState(false);
	const [hover, setHover] = useState(false);
	const [oldParent, setOldParent] = useState<Instance>();
	let dockWindowPreview = pluginGuiService.FindFirstChild(
		'RoRender V4 Preview'
	) as DockWidgetPluginGui;
	useEffect(() => {
		if (!editageImageRef.current) {
			const editableImage = assetService.CreateEditableImage({
				Size: VIEWFINDER_IMAGE_SIZE,
			});
			editageImageRef.current = editableImage;

			const content = Content.fromObject(editableImage);
			contentRef.current = content;
			setViewfinderSettings(editableImage);
		}
	}, []);

	useEffect(() => {
		let dockWindowPreviewCloseConnection: RBXScriptConnection;

		if (dockWindowPreview) {
			dockWindowPreviewCloseConnection = dockWindowPreview
				.GetPropertyChangedSignal('Enabled')
				.Connect(() => {
					setPopout(dockWindowPreview.Enabled);
					if (!dockWindowPreview.Enabled && oldParent && finderRef.current) {
						const holder = finderRef.current.FindFirstChild(
							'Holder'
						) as GuiObject;
						finderRef.current.Parent = oldParent;
						finderRef.current.BackgroundTransparency = 1;
						finderRef.current.Size = UDim2.fromOffset(180, 180);
						if (holder) {
							holder.Size = UDim2.fromOffset(150, 150);
						}
					}
				});
		}

		return () => {
			if (dockWindowPreviewCloseConnection)
				dockWindowPreviewCloseConnection.Disconnect();
		};
	}, [popout === true, finderRef.current !== undefined]);

	updateShowWater(showWater);

	const gridColor = uiConstants.groundColor;
	const gridTransparency = 0.5;
	return (
		<frame
			Size={UDim2.fromOffset(180, 180)}
			BackgroundColor3={uiConstants.groundColor}
			BackgroundTransparency={1}
			ref={finderRef}
		>
			<uipadding
				PaddingLeft={popoutPadding}
				PaddingRight={popoutPadding}
				PaddingBottom={popoutPadding}
				PaddingTop={popoutPadding}
			/>
			<uilistlayout
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Center}
				Padding={new UDim(0, uiConstants.spacingNormal)}
			/>
			<frame
				Size={UDim2.fromOffset(150, 150)}
				BackgroundColor3={uiConstants.cardColor}
				key={'Holder'}
			>
				<uiaspectratioconstraint />
				<uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
				<uistroke
					Thickness={uiConstants.borderSize}
					Color={uiConstants.primaryColor}
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
				/>

				<uipadding PaddingLeft={new UDim(0, 3)} PaddingRight={new UDim(0, 3)} />
				{/*
                <frame
                    Size={new UDim2(1,0,0,1)}
                    BackgroundTransparency={gridTransparency}
                    Position={UDim2.fromScale(0,.333)}
                    BackgroundColor3={gridColor}
                    BorderSizePixel={0}
                    ZIndex={2}
                />
                <frame
                    Size={new UDim2(1,0,0,1)}
                    BackgroundTransparency={gridTransparency}
                    Position={UDim2.fromScale(0,.666)}
                    BackgroundColor3={gridColor}
                    BorderSizePixel={0}
                    ZIndex={2}
                />
                <frame
                    Size={new UDim2(0,1,1,0)}
                    BackgroundTransparency={gridTransparency}
                    Position={UDim2.fromScale(.333,0)}
                    BackgroundColor3={gridColor}
                    BorderSizePixel={0}
                    ZIndex={2}
                />
                <frame
                    Size={new UDim2(0,1,1,0)}
                    BackgroundTransparency={gridTransparency}
                    Position={UDim2.fromScale(.333,0)}
                    BackgroundColor3={gridColor}
                    BorderSizePixel={0}
                    ZIndex={2}
                />
                */}
				<imagelabel
					Size={UDim2.fromScale(1, 1)}
					ImageContent={contentRef.current}
					BackgroundTransparency={1}
					Event={{
						MouseEnter: () => {
							if (dockWindowPreview && !popout) {
								setHover(true);
							}
						},
						MouseLeave: () => setHover(false),
					}}
				>
					<imagebutton
						Size={UDim2.fromOffset(20, 20)}
						Position={new UDim2(1, -22, 0, 5)}
						BackgroundTransparency={1}
						Image={'rbxassetid://16898669772'}
						ImageRectOffset={new Vector2(257, 514)}
						ImageRectSize={new Vector2(256, 256)}
						ImageColor3={uiConstants.primaryColor}
						Visible={hover}
						Event={{
							Activated: () => {
								dockWindowPreview.Enabled = true;
								if (finderRef.current) {
									const holder = finderRef.current.FindFirstChild(
										'Holder'
									) as GuiObject;
									setOldParent(finderRef.current?.Parent);
									finderRef.current.Parent = dockWindowPreview;
									finderRef.current.BackgroundTransparency = 0;
									finderRef.current.Size = UDim2.fromScale(1, 1);
									if (holder) {
										holder.Size = UDim2.fromOffset(150, 150);
									}
								}
								setHover(false);
								setPopout(true);
							},
						}}
					></imagebutton>
				</imagelabel>
			</frame>
			<CheckBox
				key={'show'}
				size={new UDim2(1, 0, 0, 25)}
				onChange={setShowWater}
				isChecked={showWater}
				label="Show Water in Preview"
			/>
		</frame>
	);
}
