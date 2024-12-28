-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
local color3ToVector3 = TS.import(script, game:GetService("shared"), "utils").color3ToVector3
local LIGHTING = game:GetService("Lighting")
local TERRAIN = game.Workspace.Terrain
local DELAY_TIME = 3
local SUN_POSITION = LIGHTING:GetSunDirection()
local rand = Random.new()
local castParams = RaycastParams.new()
castParams.FilterType = Enum.RaycastFilterType.Exclude
castParams.FilterDescendantsInstances = {}
local MAP_STRUCTURES = game.Workspace:FindFirstChild("Structures")
local castRay, getSamplePosition, getTerrainHit, averageColorSamples, averageShadeSamples, gammaNormalizeSamples
local function computePixel(position, settings, renderConstants)
	local xPos = renderConstants.xSpacing * position.X + settings.corners.topRight.X
	local zPos = renderConstants.ySpacing * position.Y + settings.corners.topRight.Z
	local rayCenter = Vector3.new(xPos, settings.corners.topRight.Y, zPos)
	local results = {}
	local shadowSamples = {}
	local waterHeight = 0
	local primary = castRay(rayCenter, renderConstants.rayVector)
	if not primary then
		return nil
	end
	if primary.Material == Enum.Material.Water then
		waterHeight = math.max(1, math.floor((primary.Position.Y - renderConstants.rayBottom) / renderConstants.normalizedRayTop * 255))
		primary = castRay(rayCenter, renderConstants.rayVector, true)
		if not primary then
			-- showDebugRayPosition(rayCenter.add(renderConstants.rayVector))
			return nil
		end
	end
	local _primary = primary
	table.insert(results, _primary)
	do
		local i = 1
		local _shouldIncrement = false
		while true do
			if _shouldIncrement then
				i += 1
			else
				_shouldIncrement = true
			end
			if not (i < settings.samples) then
				break
			end
			local samplePosition = getSamplePosition(rayCenter, renderConstants)
			local result = castRay(samplePosition, renderConstants.rayVector, true)
			-- showDebugRayPosition(samplePosition)
			if result then
				table.insert(results, result)
			end
		end
	end
	local terrainHit = getTerrainHit(primary, rayCenter, renderConstants.rayVector, RaycastParams.new()) or primary
	local color = averageColorSamples(results)
	color = averageShadeSamples(results, color)
	color = gammaNormalizeSamples(color)
	local height = math.floor((terrainHit.Position.Y - renderConstants.rayBottom) / renderConstants.normalizedRayTop * 255)
	local buildingGrouping = 0
	for i = 0, #settings.buildingGroups - 1 do
		local grouping = settings.buildingGroups[i + 1]
		if grouping.instances then
			local _result = grouping.instances
			if _result ~= nil then
				_result = #_result
			end
			for j = 0, _result - 1 do
				local item = grouping.instances[j + 1]
				if primary.Instance:IsDescendantOf(item) then
					buildingGrouping = i + 1
					break
				end
			end
		end
		if buildingGrouping ~= 0 then
			break
		end
		if grouping.materials then
			local _exp = grouping.materials
			-- ▼ ReadonlyArray.findIndex ▼
			local _callback = function(x)
				return x == primary.Material
			end
			local _result = -1
			for _i, _v in _exp do
				if _callback(_v, _i - 1, _exp) == true then
					_result = _i - 1
					break
				end
			end
			-- ▲ ReadonlyArray.findIndex ▲
			local idx = _result
			if idx ~= -1 then
				buildingGrouping = i + 1
				break
			end
		end
	end
	local roadGrouping = 0
	for i = 0, #settings.roadGroups - 1 do
		local grouping = settings.roadGroups[i + 1]
		if grouping.instances then
			local _result = grouping.instances
			if _result ~= nil then
				_result = #_result
			end
			for j = 0, _result - 1 do
				local item = grouping.instances[j + 1]
				if primary.Instance:IsDescendantOf(item) then
					roadGrouping = i + 1
					break
				end
			end
		end
		if roadGrouping ~= 0 then
			break
		end
		if grouping.materials then
			local _exp = grouping.materials
			-- ▼ ReadonlyArray.findIndex ▼
			local _callback = function(x)
				return x == primary.Material
			end
			local _result = -1
			for _i, _v in _exp do
				if _callback(_v, _i - 1, _exp) == true then
					_result = _i - 1
					break
				end
			end
			-- ▲ ReadonlyArray.findIndex ▲
			local idx = _result
			local onlyUseTerrainAndPrimaryIsTerrain = if grouping.onlyTerrain then primary.Instance.ClassName == "Terrain" else true
			if idx ~= -1 and onlyUseTerrainAndPrimaryIsTerrain then
				roadGrouping = i + 1
				break
			end
		end
	end
	local _materialMap = renderConstants.materialMap
	local _material = primary.Material
	local _value = _materialMap[_material]
	if not (_value ~= 0 and _value == _value and _value) then
		local _exp = renderConstants.materialMap
		local _exp_1 = primary.Material
		local _materialMap_1 = renderConstants.materialMap
		local _material_1 = primary.Material
		print(_exp, _exp_1, (_materialMap_1[_material_1]))
	end
	local _object = {
		r = math.floor(color.X * 255),
		g = math.floor(color.Y * 255),
		b = math.floor(color.Z * 255),
		h = height,
	}
	local _left = "material"
	local _materialMap_1 = renderConstants.materialMap
	local _material_1 = primary.Material
	local _condition = _materialMap_1[_material_1]
	if not (_condition ~= 0 and _condition == _condition and _condition) then
		_condition = 0
	end
	_object[_left] = _condition
	_object.road = roadGrouping
	_object.building = buildingGrouping
	_object.water = waterHeight
	return _object
end
function getSamplePosition(rayCenter, renderConstants)
	local randomOffset = Vector3.new(rand:NextNumber() * renderConstants.xSpacing - renderConstants.xSpacing / 2, 0, rand:NextNumber() * renderConstants.ySpacing - renderConstants.ySpacing / 2)
	local _rayCenter = rayCenter
	return randomOffset + _rayCenter
end
function castRay(rayPosition, rayVector, ignoreWater, rayParams)
	if ignoreWater == nil then
		ignoreWater = false
	end
	if rayParams == nil then
		rayParams = castParams
	end
	rayParams.IgnoreWater = ignoreWater
	return game.Workspace:Raycast(rayPosition, rayVector, rayParams)
end
local function findHighestAncestorThatDoesNotShareParent(instance, terrain)
	-- ▼ ReadonlyArray.some ▼
	local _result = false
	local _callback = function(terrainItem)
		return instance.Parent and instance.Parent:IsAncestorOf(terrainItem)
	end
	for _k, _v in terrain do
		if _callback(_v, _k - 1, terrain) then
			_result = true
			break
		end
	end
	-- ▲ ReadonlyArray.some ▲
	if _result then
		return instance
	end
	if instance.Parent then
		return findHighestAncestorThatDoesNotShareParent(instance.Parent, terrain)
	end
	return nil
end
function getTerrainHit(RaycastResult, rayPosition, rayVector, castParams, terrain)
	if terrain == nil then
		terrain = { game.Workspace.Terrain }
	end
	-- ▼ ReadonlyArray.find ▼
	local _callback = function(terrain)
		return RaycastResult.Instance == terrain
	end
	local _result
	for _i, _v in terrain do
		if _callback(_v, _i - 1, terrain) == true then
			_result = _v
			break
		end
	end
	-- ▲ ReadonlyArray.find ▲
	if _result then
		return RaycastResult
	end
	local result = castRay(rayPosition, rayVector, true, castParams)
	if result then
		local highestNonCommonAncestor = findHighestAncestorThatDoesNotShareParent(result.Instance, terrain)
		if not highestNonCommonAncestor then
			return nil
		end
		castParams:AddToFilter(highestNonCommonAncestor)
		castParams.FilterType = Enum.RaycastFilterType.Exclude
		return getTerrainHit(result, rayPosition, rayVector, castParams, terrain)
	end
	return nil
end
local function getColorFromResult(result)
	if result.Instance ~= game.Workspace.Terrain then
		return color3ToVector3(result.Instance.Color)
	end
	if result.Material == Enum.Material.Water then
		return color3ToVector3(TERRAIN.WaterColor)
	end
	return color3ToVector3(TERRAIN:GetMaterialColor(result.Material))
end
local function srgbToLinear(color)
	if color <= 0.04045 then
		return color / 12.92
	else
		return math.pow((color + 0.055) / 1.055, 2.4)
	end
end
local function linearToSrgb(color)
	if color <= 0.0031308 then
		return color * 12.92
	else
		return 1.055 * math.pow(color, 1 / 2.4) - 0.055
	end
end
local function convertVector3SrgbToLinear(vector)
	return Vector3.new(srgbToLinear(vector.X), srgbToLinear(vector.Y), srgbToLinear(vector.Z))
end
local function convertVector3LinearToSrgb(vector)
	return Vector3.new(linearToSrgb(vector.X), linearToSrgb(vector.Y), linearToSrgb(vector.Z))
end
function averageColorSamples(rayCastResults)
	local color = Vector3.new(0, 0, 0)
	-- ▼ ReadonlyArray.forEach ▼
	local _callback = function(result)
		local _color = color
		local _arg0 = convertVector3SrgbToLinear(getColorFromResult(result))
		color = _color + _arg0
	end
	for _k, _v in rayCastResults do
		_callback(_v, _k - 1, rayCastResults)
	end
	-- ▲ ReadonlyArray.forEach ▲
	local _color = color
	local _arg0 = #rayCastResults
	return convertVector3LinearToSrgb(_color / _arg0)
end
function gammaNormalizeSamples(samples)
	local gammeNormalize = 1.1
	return Vector3.new(samples.X ^ gammeNormalize, samples.Y ^ gammeNormalize, samples.Z ^ gammeNormalize)
end
local function showDebugRayPosition(position)
	local part = Instance.new("Part")
	part.Anchored = true
	part.CFrame = CFrame.new(position)
	part.Color = Color3.new(1, 0, 0)
	part.Size = Vector3.new(1, 1, 1)
	part.Parent = game.Workspace
end
local shadeColor
function averageShadeSamples(rayCastResults, inputColor)
	local color = Vector3.new(0, 0, 0)
	-- ▼ ReadonlyArray.forEach ▼
	local _callback = function(result)
		local _color = color
		local _arg0 = convertVector3SrgbToLinear(shadeColor(inputColor, result))
		color = _color + _arg0
	end
	for _k, _v in rayCastResults do
		_callback(_v, _k - 1, rayCastResults)
	end
	-- ▲ ReadonlyArray.forEach ▲
	local _color = color
	local _arg0 = #rayCastResults
	return convertVector3LinearToSrgb(_color / _arg0)
end
function shadeColor(color, result)
	local recievedIlluminance = math.max(result.Normal:Dot(SUN_POSITION), 0)
	local _color = color
	local _arg0 = 0.2 + recievedIlluminance * 0.8
	return _color * _arg0
end
local function delayForScriptExhuastion(startTime, delayTime)
	if delayTime == nil then
		delayTime = DELAY_TIME
	end
	if tick() - startTime > delayTime then
		task.wait(0.1)
		return tick()
	else
		return startTime
	end
end
return {
	computePixel = computePixel,
	delayForScriptExhuastion = delayForScriptExhuastion,
}
