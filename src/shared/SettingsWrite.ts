const ScriptEditorService = game.GetService('ScriptEditorService');

export class ToString {
	static spkey = `${utf8.char(0xe100)}`;
	static getInstancePath(instance: Instance, separator: string = "."): string {
		const pathSegments: string[] = [];
		let current: Instance | undefined = instance;
	
		// Traverse upwards to the root
		while (current && current !== game) {
			const name = current.Name;
			const space = name.find(' ');
			// Check if the name contains spaces or special characters
			if (space[0]) {
				pathSegments.unshift(`["${name}"]`); // Use bracket notation
			} else {
				pathSegments.unshift(name); // Normal dot notation
			}
			current = current.Parent;
		}
	
		// Ensure 'game' is at the start
		pathSegments.unshift("game");
	
		// Correctly format the final path
		let finalPath = pathSegments[0]; // Start with "game"
		for (let i = 1; i < pathSegments.size(); i++) {
			if (pathSegments[i].sub(0, 1) === "[") {
				finalPath += pathSegments[i]; // Append bracket notation directly
			} else {
				finalPath += separator + pathSegments[i]; // Add separator before normal names
			}
		}
	
		return finalPath;
	}

	static string(value: string, indent: number, isValue?: boolean): [string, boolean] {
		const space = value.find(' ');
		const spkey = ToString.spkey
		if (value.sub(0, spkey.size()) === spkey) {
			return $tuple(`${value.sub(spkey.size() + 1)}`, false);
		}
		if (space[0] || isValue) {
			return $tuple(`"${value}"`, true);
		}
		return $tuple(`${value}`, false);
	}
	static number(value: number, indent: number, isValue?: boolean): string {
		return `${value}`;
	}
	static boolean(value: number, indent: number, isValue?: boolean): string {
		return `${value}`;
	}
	static EnumItem(value: EnumItem, indent: number, isValue?: boolean): string {
		return `Enum.${value.EnumType}.${value.Name}`;
	}
	static Instance(value: Instance, indent: number, isValue?: boolean): string {
		return `${ToString.getInstancePath(value)}`;
	}
	static Vector2(value: Vector2, indent: number, isValue?: boolean): string {
		return `Vector2.new(${value.X}, ${value.Y})`;
	}
	static Vector3(value: Vector3, indent: number, isValue?: boolean): string {
		return `Vector3.new(${value.X}, ${value.Y}, ${value.Z})`;
	}
	static Color3(value: Color3, indent: number, isValue?: boolean): string {
		return `Color3.fromRGB(${math.floor(value.R * 255)}, ${math.floor(
			value.G * 255
		)}, ${math.floor(value.B * 255)})`;
	}
	static DateTime(value: DateTime, indent: number, isValue?: boolean): string {
		const utcTime = value.ToUniversalTime();
		return `DateTime.fromUniversalTime(${utcTime.Year}, ${utcTime.Month}, ${utcTime.Day}, ${utcTime.Hour}, ${utcTime.Minute}, ${utcTime.Second}, ${utcTime.Millisecond})`;
	}
	static ColorSequence(value: ColorSequence, indent: number, isValue?: boolean): string {
		let colorSeqStr = '{';
		for (const keypoint of value.Keypoints) {
			colorSeqStr += `ColorSequenceKeypoint.new(${
				keypoint.Time
			}, Color3.fromRGB(${math.floor(keypoint.Value.R * 255)}, ${math.floor(
				keypoint.Value.G * 255
			)}, ${math.floor(keypoint.Value.B * 255)})), `;
		}
		colorSeqStr = colorSeqStr.sub(0, -2) + '}';
		return `ColorSequence.new(${colorSeqStr})`;
	}
	static NumberSequence(value: NumberSequence, indent: number, isValue?: boolean): string {
		let numberSeqStr = '{';
		for (const keypoint of value.Keypoints) {
			numberSeqStr += `NumberSequenceKeypoint.new(${keypoint.Time}, ${keypoint.Value}), `;
		}
		numberSeqStr = numberSeqStr.sub(0, -2) + '}';
		return `NumberSequence.new(${numberSeqStr})`;
	}
	static table(
		value: object,
		indent = 0,
		comments?: Record<string, string>,
		isValue?: boolean
	): string {
		let result = '{';
		let first = true;
		const indentStr = '	'.rep(indent);
		const indentStrEnd = '	'.rep(indent - 1);

		for (const [k, val] of pairs(value)) {
			let cresult = [ToString.Convert(k, 0, comments)];
			let key = cresult[0];
			let space = cresult[1];
			if (space)
				result += `\n${indentStr}[${key}] = ${ToString.Convert(
					val,
					indent + 1,
					comments,
					true
				)}`;
			else if (tonumber(key))
				result += `\n${indentStr}${ToString.Convert(
					val,
					indent + 1,
					comments,
					true
				)}`;
			else
				result += `\n${indentStr}${key} = ${ToString.Convert(
					val,
					indent + 1,
					comments,
					true
				)}`;
			result += ',';
			const comment =
				comments && comments[k as string] ? ` -- ${comments[k as string]}` : '';
			result += comment;
		}

		return result + '\n' + indentStrEnd + '}';
	}
	static Convert(
		value: any,
		indent: number = 1,
		comments?: Record<string, string>,
		isValue?: boolean
	): [any, any] {
		const ctype = typeOf(value);
		if (ctype === 'EnumItem') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else if (ctype === 'string') {
			return ToString[ctype](value, indent, isValue);
		} else if (ctype === 'number') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else if (ctype === 'boolean') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else if (ctype === 'Vector2') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else if (ctype === 'Vector3') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else if (ctype === 'Color3') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else if (ctype === 'DateTime') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else if (ctype === 'ColorSequence') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else if (ctype === 'NumberSequence') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else if (ctype === 'table') {
			return $tuple(ToString[ctype](value, indent), false);
		} else if (ctype === 'Instance') {
			return $tuple(ToString[ctype](value, indent, isValue), false);
		} else return $tuple(tostring(value), false);
	}
	static AddLine(data: string[], line: string) {
		data.push(line);
	}
	static writeModuleScript(
		Table: any,
		loc: ModuleScript,
		top: any,
		comments?: Record<string, string>,
		delydedRunCallback?: () => void
	) {
		const data: string[] = [];
		ToString.AddLine(data, `${top}`);
		ToString.AddLine(
			data,
			`local settings: Settings = ${ToString.Convert(Table, 1)}`
		);
		ToString.AddLine(data, `return settings`);
		ScriptEditorService.UpdateSourceAsync(loc, (oldSource: string) => {
			return data.join('\n');
		});
		let con: RBXScriptConnection
		con = loc.GetPropertyChangedSignal("Source").Connect(() => {
			con.Disconnect()
			if (delydedRunCallback) delydedRunCallback()
		})
	}
}
