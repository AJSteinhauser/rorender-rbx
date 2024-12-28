-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
local getImageDimensions = TS.import(script, game:GetService("shared"), "utils").getImageDimensions
local COMPUTE_ROW_MESSAGE = TS.import(script, game:GetService("actor"), "actor.model").COMPUTE_ROW_MESSAGE
local WorkerPool = TS.import(script, game:GetService("shared"), "render", "actor-pool.handler").WorkerPool
local generateBufferChannels = TS.import(script, game:GetService("shared"), "file", "file.utils").generateBufferChannels
local delayForScriptExhuastion = TS.import(script, game:GetService("shared"), "render", "render.utils").delayForScriptExhuastion
local getRenderConstants, combineAllBuffers
local render = TS.async(function(settings)
	local imageDimensions = getImageDimensions(settings)
	local renderConstants = getRenderConstants(settings, imageDimensions)
	local pool = WorkerPool.new(settings)
	local calculatedRows = {}
	local allRowsCompleted = {}
	local startTime = tick()
	local finishedRows = 0
	local lastRowPrinted = 0
	do
		local _row = 0
		local _shouldIncrement = false
		while true do
			local row = _row
			if _shouldIncrement then
				row += 1
			else
				_shouldIncrement = true
			end
			if not (row < imageDimensions.Y) then
				break
			end
			startTime = delayForScriptExhuastion(startTime)
			local actorMessage = {
				settings = settings,
				row = row,
				renderConstants = renderConstants,
			}
			local rowCompleted = TS.Promise.new(TS.async(function(resolve)
				local actor = TS.await(pool.getActor(settings))
				local rowCalculatedEvent = actor:FindFirstChild("rowCalculated")
				local binding
				binding = rowCalculatedEvent.Event:Connect(function(data)
					startTime = delayForScriptExhuastion(startTime)
					calculatedRows[row + 1] = data
					binding:Disconnect()
					pool.cleanupActor(actor)
					finishedRows += 1
					local currentCompletion = finishedRows / imageDimensions.Y
					if currentCompletion - lastRowPrinted > 0.01 then
						print(`finished rows: {string.format("%.2f", (finishedRows / imageDimensions.Y) * 100)}%`)
						lastRowPrinted = currentCompletion
					end
					resolve()
				end)
				actor:SendMessage(COMPUTE_ROW_MESSAGE, actorMessage)
			end))
			table.insert(allRowsCompleted, rowCompleted)
			_row = row
		end
	end
	TS.await(TS.Promise.all(allRowsCompleted))
	local output = combineAllBuffers(calculatedRows, settings)
	return output
end)
local function getRenderMaterialMap()
	local materials = Enum.Material:GetEnumItems()
	local materialMap = {}
	local counter = 1
	-- ▼ ReadonlyArray.forEach ▼
	local _callback = function(material)
		local _material = material
		local _counter = counter
		materialMap[_material] = _counter
		counter += 1
	end
	for _k, _v in materials do
		_callback(_v, _k - 1, materials)
	end
	-- ▲ ReadonlyArray.forEach ▲
	return materialMap
end
function combineAllBuffers(buffs, settings)
	local output = generateBufferChannels(settings)
	local imageDimensions = getImageDimensions(settings)
	for i = 0, #buffs - 1 do
		buffer.writestring(output.red, i * imageDimensions.X, buffer.tostring(buffs[i + 1].red))
		buffer.writestring(output.green, i * imageDimensions.X, buffer.tostring(buffs[i + 1].green))
		buffer.writestring(output.blue, i * imageDimensions.X, buffer.tostring(buffs[i + 1].blue))
		buffer.writestring(output.height, i * imageDimensions.X, buffer.tostring(buffs[i + 1].height))
		buffer.writestring(output.material, i * imageDimensions.X, buffer.tostring(buffs[i + 1].material))
		buffer.writestring(output.roads, i * imageDimensions.X, buffer.tostring(buffs[i + 1].roads))
		buffer.writestring(output.buildings, i * imageDimensions.X, buffer.tostring(buffs[i + 1].buildings))
		buffer.writestring(output.water, i * imageDimensions.X, buffer.tostring(buffs[i + 1].water))
	end
	return output
end
function getRenderConstants(settings, imageDimensions)
	local rayLength = math.abs(settings.corners.topRight.Y - settings.corners.bottomLeft.Y)
	local rayBottom = settings.corners.topRight.Y - rayLength
	local normalizedRayTop = settings.corners.topRight.Y - rayBottom
	local materialMap = getRenderMaterialMap()
	return {
		rayLength = rayLength,
		imageDimensions = imageDimensions,
		xSpacing = math.abs(settings.corners.bottomLeft.X - settings.corners.topRight.X) / imageDimensions.X,
		ySpacing = math.abs(settings.corners.bottomLeft.Z - settings.corners.topRight.Z) / imageDimensions.Y,
		rayVector = Vector3.new(0, -1, 0) * rayLength,
		rayBottom = rayBottom,
		normalizedRayTop = normalizedRayTop,
		materialMap = materialMap,
	}
end
return {
	render = render,
	getRenderMaterialMap = getRenderMaterialMap,
}
