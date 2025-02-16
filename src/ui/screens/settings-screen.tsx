import { Screens } from 'ui/constants';
import { ProgressUpdateHooks } from './main';
import uiConstants from 'ui/ui-constants';
import { Button, ButtonType } from 'ui/button';
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useState,
} from '@rbxts/react';
import { getCurrentRender } from 'ui/config-helper';
import { Settings } from 'shared/settings/settings.model';
import { firstLetterUppercase } from 'shared/utils';
import VerticalExpandingList from 'ui/verticalexpandinglist';
import VerticalCollapsibleSection from 'ui/verticalcollapsiblesection';
import Checkbox from 'ui/checkbox';
import Tooltip from 'ui/tooltip';
import { ToString } from 'shared/SettingsWrite';
import settingstypes from 'ui/settingstypes';
import { array } from '@rbxts/react/src/prop-types';
import TagMenu from 'ui/tag-menu';
import MaterialMenu from 'ui/material-menu';

const blacklistedSettings = ['mapCFrame', 'mapScale', 'sunDirection'];
const groupSettings = ['buildingGroups', 'roadGroups'];
const KeyToGroupName: Record<string, string> = {
	buildingGroups: 'Building Groups',
	roadGroups: 'Road Groups',
};
interface StructureGrouping {
	name: string;
	materials?: Array<Enum.Material>;
	instances: Array<Instance>;
	onlyTerrain?: boolean;
}

const deepCopy = (original: Record<any, any>) => {
	let copy: Record<any, any> = {};

	for (const [key, value] of pairs(original)) {
		copy[key] =
			(type(value) === 'table' && deepCopy(value)) ||
			(value as CheckablePrimitives);
	}

	return copy;
};

export function SettingsScreen(props: {
	changeScreen: (screen: Screens) => void;
}) {
	const [settingsnodes, setSettingsnodes] = useState<Array<React.Element>>([]);
	const [tagmenu, setTagmenu] = useState<React.Element>();
	let currentRender: Record<any, any> = require((
		getCurrentRender() as ModuleScript
	).Clone()) as Settings;
	const propertybox = (props: {
		name: string;
		value: any;
		propertyChanged: (newValue: any) => void;
		onRemove?: () => void;
		type: 'boolean' | 'number' | 'string' | 'Instance' | 'EnumItem' | 'tag';
	}) => {
		return (
			<frame
				Size={new UDim2(1, 0, 0, 30)}
				BackgroundColor3={uiConstants.groundColor}
			>
				<uicorner CornerRadius={new UDim(0, uiConstants.cornerRadius)} />
				<uistroke
					Color={uiConstants.primaryColor}
					ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
					Thickness={uiConstants.borderSize}
				/>
				<uipadding
					PaddingLeft={new UDim(0, 10)}
					PaddingRight={new UDim(0, 10)}
				/>

				<frame Size={UDim2.fromScale(0.5, 1)} BackgroundTransparency={1}>
					<textlabel
						TextSize={uiConstants.fontSizeNormal}
						BackgroundTransparency={1}
						Font={uiConstants.boldFont}
						TextColor3={uiConstants.primaryColor}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextYAlignment={Enum.TextYAlignment.Center}
						Size={UDim2.fromScale(0.5, 1)}
						Text={props.name + ':'}
					/>
				</frame>

				<frame
					Size={UDim2.fromScale(0.5, 1)}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.5, 0)}
				>
					{(props.type === 'number' || props.type === 'string') && [
						<Tooltip
							Text="test"
							AnchorPoint={new Vector2(0.5, 0)}
							offset={new Vector2(0, 17)}
						/>,
						<textbox
							TextSize={uiConstants.fontSizeNormal}
							Font={uiConstants.lessboldFont}
							BackgroundTransparency={1}
							TextColor3={uiConstants.secondayText}
							TextXAlignment={Enum.TextXAlignment.Right}
							TextYAlignment={Enum.TextYAlignment.Center}
							Size={UDim2.fromScale(1, 1)}
							Text={props.value}
							ClearTextOnFocus={false}
							Event={{
								FocusLost: (changed) => {
									props.propertyChanged(changed.Text);
								},
							}}
						/>,
					]}
					{props.type === 'boolean' && [
						<Tooltip
							Text="test"
							AnchorPoint={new Vector2(0.5, 0)}
							offset={new Vector2(0, 17)}
						/>,
						<Checkbox
							TextColor={uiConstants.primaryText}
							BoxSize={20}
							Position={UDim2.fromOffset(0, 5)}
							ContentAlignment={Enum.HorizontalAlignment.Right}
							Value={props.value}
							OnChanged={() => {
								const flip: boolean = props.value;
								props.propertyChanged(!flip);
							}}
						/>,
					]}
					{props.type === 'tag' && [
						<textlabel
							TextSize={uiConstants.fontSizeNormal}
							Font={uiConstants.lessboldFont}
							BackgroundTransparency={1}
							TextColor3={uiConstants.secondayText}
							TextXAlignment={Enum.TextXAlignment.Right}
							TextYAlignment={Enum.TextYAlignment.Center}
							Size={UDim2.fromScale(1, 1)}
							Position={new UDim2(0, -20, 0, 0)}
							Text={props.value}
						>
							<Tooltip
								Text={'Tag'}
								AnchorPoint={new Vector2(0.5, 0)}
								offset={new Vector2(0, 17)}
							/>
						</textlabel>,
						<imagebutton
							Size={UDim2.fromOffset(20, 20)}
							Image={'rbxassetid://16898789012'}
							ImageColor3={uiConstants.primaryColor}
							ImageRectOffset={new Vector2(0, 257)}
							ImageRectSize={new Vector2(256, 256)}
							BackgroundTransparency={1}
							AnchorPoint={new Vector2(0.5, 0.5)}
							Position={new UDim2(1, -8, 0.5, 0)}
							Event={{
								Activated: () => {
									if (props.onRemove) props.onRemove();
								},
							}}
						>
							<Tooltip
								Text={'Remove Tag'}
								AnchorPoint={new Vector2(0.5, 0)}
								offset={new Vector2(0, 17)}
							/>
						</imagebutton>,
					]}
					{(props.type === 'Instance' || props.type === 'EnumItem') && [
						<Tooltip
							Text={
								props.type === 'EnumItem'
									? `${tostring(props.value)}`
									: `${(props.value as Instance).GetFullName()}`
							}
							AnchorPoint={new Vector2(0.5, 0)}
							offset={new Vector2(0, 17)}
						/>,
						<textlabel
							TextSize={uiConstants.fontSizeNormal}
							Font={uiConstants.lessboldFont}
							BackgroundTransparency={1}
							TextColor3={uiConstants.secondayText}
							TextXAlignment={Enum.TextXAlignment.Right}
							TextYAlignment={Enum.TextYAlignment.Center}
							Size={UDim2.fromScale(1, 1)}
							Position={new UDim2(0, -20, 0, 0)}
							Text={(props.value as Instance | EnumItem).Name}
						/>,
						<imagebutton
							Size={UDim2.fromOffset(20, 20)}
							Image={'rbxassetid://16898789012'}
							ImageColor3={uiConstants.primaryColor}
							ImageRectOffset={new Vector2(0, 257)}
							ImageRectSize={new Vector2(256, 256)}
							BackgroundTransparency={1}
							AnchorPoint={new Vector2(0.5, 0.5)}
							Position={new UDim2(1, -8, 0.5, 0)}
							Event={{
								Activated: () => {
									if (props.onRemove) props.onRemove();
								},
							}}
						>
							<Tooltip
								Text={
									props.type === 'EnumItem'
										? `Remove ${(props.value as EnumItem).EnumType}`
										: 'Remove Instance'
								}
								AnchorPoint={new Vector2(0.5, 0)}
								offset={new Vector2(0, 17)}
							/>
						</imagebutton>,
					]}
				</frame>
			</frame>
		);
	};

	const saveSettings = () => {
		const m = getCurrentRender() as ModuleScript;
		const tosave = deepCopy(currentRender);
		tosave['mapScale'] = `${ToString.spkey}boxTarget.mesh.Scale`;
		tosave['mapCFrame'] = `${ToString.spkey}boxTarget.CFrame`;
		tosave['shadows'][
			'sunDirection'
		] = `${ToString.spkey}game:GetService("Lighting"):GetSunDirection()`;
		ToString.writeModuleScript(tosave, m, settingstypes, undefined, () => {
			setSettingsnodes([]);
		});
		// if (typeOf(currentRender) === 'table') setSettingsnodes(renderSettings(currentRender));
	};

	const NoDupName = (
		t: Array<StructureGrouping>,
		GroupName: string
	): string => {
		let size = t.size();
		let Letter = utf8.char(97 + size);

		const checkname = (name: string): boolean => {
			let found = false;
			for (const [i, v] of ipairs(t)) {
				if (v.name === name) {
					found = true;
					break;
				}
			}
			return found;
		};

		while (checkname(`${GroupName} ${Letter.upper()}`)) {
			size++;
			Letter = utf8.char(97 + size);
		}

		return `${GroupName} ${Letter.upper()}`;
	};

	const addGroup = (t: Array<StructureGrouping>, key: string) => {
		const GroupName = KeyToGroupName[(key || '') as string];
		const name = NoDupName(t, GroupName);
		if (key === 'roadGroups')
			t.push({
				name: name,
				materials: [],
				onlyTerrain: false,
				instances: [],
			});
		else
			t.push({
				name: name,
				instances: [],
			});
		saveSettings();
	};

	const renderSettings = (
		t: Record<string | number, any>,
		Indent?: number,
		ParentKey?: string | number
	): Array<React.Element> => {
		const nodes = new Array<React.Element>();
		const az: Array<string | number> = [];

		for (const [settings, value] of pairs(t)) {
			az.push(settings);
		}

		az.sort();

		for (const [index, key] of ipairs(az)) {
			if (!blacklistedSettings.includes(key as string)) {
				const stype = typeOf(t[key]);
				const value = t[key];
				if (stype === 'table') {
					let isArray = false;
					for (const [i, v] of pairs(value)) {
						if (typeOf(v) === 'string') {
							isArray = false;
							break;
						}
					}

					if (typeOf(key) === 'number') isArray = true;
					if (isArray) {
						if (groupSettings.includes(ParentKey as string)) {
							let content = [
								<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
									<imagebutton
										Size={UDim2.fromOffset(20, 20)}
										Image={'rbxassetid://16898789012'}
										ImageColor3={uiConstants.primaryColor}
										ImageRectOffset={new Vector2(0, 257)}
										ImageRectSize={new Vector2(256, 256)}
										BackgroundTransparency={1}
										AnchorPoint={new Vector2(0.5, 0.5)}
										Position={new UDim2(1, -18, 0.5, 0)}
										Event={{
											Activated: () => {
												t[key] = undefined;
												saveSettings();
											},
										}}
									>
										<Tooltip
											Text="Remove Group"
											AnchorPoint={new Vector2(0.5, 0)}
											offset={new Vector2(0, 17)}
										/>
									</imagebutton>
								</frame>,
							];

							nodes.push(
								<VerticalCollapsibleSection
									HeaderText={`${firstLetterUppercase(key as string)}`}
									ArrowColor={uiConstants.primaryColor}
									BorderColor={uiConstants.primaryColor}
									TextColor={uiConstants.primaryColor}
									Padding={uiConstants.spacingNormal}
									Indent={(Indent || 1) + 1}
									Content={content}
								>
									{renderSettings(value, 1, key as string)}
								</VerticalCollapsibleSection>
							);
						}
					} else if (!isArray) {
						let content = undefined;

						if (groupSettings.includes(key as string)) {
							content = [
								<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
									<imagebutton
										Size={UDim2.fromOffset(20, 20)}
										Image={'rbxassetid://16898732061'}
										ImageColor3={uiConstants.primaryColor}
										ImageRectOffset={new Vector2(257, 0)}
										ImageRectSize={new Vector2(256, 256)}
										BackgroundTransparency={1}
										AnchorPoint={new Vector2(0.5, 0.5)}
										Position={new UDim2(1, -18, 0.5, 0)}
										Event={{
											Activated: () => {
												addGroup(
													value as Array<StructureGrouping>,
													key as string
												);
											},
										}}
									>
										<Tooltip
											Text="Add Group"
											AnchorPoint={new Vector2(0.5, 0)}
											offset={new Vector2(0, 17)}
										/>
									</imagebutton>
								</frame>,
							];
						} else if (key === 'instances') {
							const tags: Array<string> = []
							for (const [tag, instance] of pairs(value)) { 
								if (typeOf(instance) === 'string') tags.push(instance)
							}

							content = [
								<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
									<imagebutton
										Size={UDim2.fromOffset(20, 20)}
										Image={'rbxassetid://16898732061'}
										ImageColor3={uiConstants.primaryColor}
										ImageRectOffset={new Vector2(257, 0)}
										ImageRectSize={new Vector2(256, 256)}
										BackgroundTransparency={1}
										AnchorPoint={new Vector2(0.5, 0.5)}
										Position={new UDim2(1, -18, 0.5, 0)}
										Event={{
											Activated: () => {
												const selectedInstances = game
													.GetService('Selection')
													.Get();
												for (const [key, inst] of pairs(selectedInstances)) {
													if (
														(inst.IsA('BasePart') ||
															inst.IsA('Model') ||
															inst.IsA('Folder')) &&
														inst.IsDescendantOf(game.Workspace)
													)
														(value as Array<Instance>).push(inst);
												}
												saveSettings();
											},
										}}
									>
										<Tooltip
											Text="Add Selections To Instances"
											AnchorPoint={new Vector2(0.5, 0)}
											offset={new Vector2(0, 17)}
										/>
									</imagebutton>

									<TagMenu
										Size={UDim2.fromOffset(20, 20)}
										ImageColor3={uiConstants.primaryColor}
										AnchorPoint={new Vector2(0.5, 0.5)}
										Position={new UDim2(1, -40, 0.5, 0)}
										onTagSelected={(tag: string) => {
											if (tags.includes(tag)) return
											(value as Array<string>).push(tag);
                                            saveSettings();
										}}
									/>
								</frame>,
							];
						} else if (key === 'materials') {
							content = [
								<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
									<MaterialMenu
										Size={UDim2.fromOffset(20, 20)}
										ImageColor3={uiConstants.primaryColor}
										AnchorPoint={new Vector2(0.5, 0.5)}
										Position={new UDim2(1, -18, 0.5, 0)}
										onMaterialSelected={(material: Enum.Material) => {
											if ((value as Array<Enum.Material>).includes(material)) return
											(value as Array<Enum.Material>).push(material);
                                            saveSettings();
										}}
									/>
								</frame>,
							];
						}

						nodes.push(
							<VerticalCollapsibleSection
								HeaderText={`${firstLetterUppercase(key as string)}`}
								ArrowColor={uiConstants.primaryColor}
								BorderColor={uiConstants.primaryColor}
								TextColor={uiConstants.primaryColor}
								Padding={uiConstants.spacingNormal}
								Indent={(Indent || 1) + 1}
								Content={content}
							>
								{renderSettings(value, 1, key as string)}
							</VerticalCollapsibleSection>
						);
					}
				} else if (stype === 'number') {
					nodes.push(
						propertybox({
							name: `${firstLetterUppercase(key as string)}`,
							value: value,
							propertyChanged: (newValue) => {
								t[key] = tonumber(newValue);
								saveSettings();
							},
							type: 'number',
						})
					);
				} else if (stype === 'string') {
					if (ParentKey === 'instances') {
						nodes.push(
							propertybox({
								name: `${firstLetterUppercase(key as string)}`,
								value: value,
								propertyChanged: (newValue) => {
									t[key] = newValue;
								},
								type: 'tag',
							})
						);
					} else {
						nodes.push(
							propertybox({
								name: `${firstLetterUppercase(key as string)}`,
								value: value,
								propertyChanged: (newValue) => {
									t[key] = newValue;
								},
								type: 'string',
							})
						);
					}
				} else if (stype === 'boolean') {
					nodes.push(
						propertybox({
							name: `${firstLetterUppercase(key as string)}`,
							value: value,
							propertyChanged: (newValue) => {
								t[key] = newValue;
								saveSettings();
							},
							type: 'boolean',
						})
					);
				} else if (stype === 'EnumItem' || stype === 'Instance') {
					nodes.push(
						propertybox({
							name: `${firstLetterUppercase(key as string)}`,
							value: value,
							propertyChanged: (newValue) => {
								t[key] = newValue;
								saveSettings();
							},
							onRemove: () => {
								t[key] = undefined;
								saveSettings();
							},
							type: stype,
						})
					);
				}
			}
		}

		return nodes;
	};

	useLayoutEffect(() => {
		if (settingsnodes.size() === 0 && typeOf(currentRender) === 'table')
			setSettingsnodes(renderSettings(currentRender));
	}, [settingsnodes.size() === 0]);

	return (
		<frame Size={UDim2.fromScale(1, 1)} BackgroundTransparency={1}>
			<Button
				label="Back"
				buttonType={ButtonType.outline}
				size={new UDim2(1, 0, 0, 30)}
				clicked={() => props.changeScreen(Screens.Configuration)}
			/>
			<scrollingframe
				Size={new UDim2(1, 0, 1, -40)}
				Position={UDim2.fromOffset(0, 40)}
				BackgroundTransparency={1}
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
					PaddingBottom={new UDim(0, 1)}
					PaddingLeft={new UDim(0, 1)}
					PaddingRight={new UDim(0, 1)}
					PaddingTop={new UDim(0, 1)}
				/>
				<uilistlayout
					HorizontalAlignment={Enum.HorizontalAlignment.Center}
					VerticalAlignment={Enum.VerticalAlignment.Top}
					Padding={new UDim(0, uiConstants.spacingNormal)}
				/>
				{settingsnodes}
				{tagmenu}
			</scrollingframe>
		</frame>
	);
}
