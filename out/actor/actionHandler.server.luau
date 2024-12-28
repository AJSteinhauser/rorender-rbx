-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
local COMPUTE_ROW_MESSAGE = TS.import(script, game:GetService("actor"), "actor.model").COMPUTE_ROW_MESSAGE
local _render_utils = TS.import(script, game:GetService("shared"), "render", "render.utils")
local computePixel = _render_utils.computePixel
local delayForScriptExhuastion = _render_utils.delayForScriptExhuastion
local getImageDimensions = TS.import(script, game:GetService("shared"), "utils").getImageDimensions
local _file_utils = TS.import(script, game:GetService("shared"), "file", "file.utils")
local generateBufferChannels = _file_utils.generateBufferChannels
local writePixelToImageBuffer = _file_utils.writePixelToImageBuffer
local getRenderMaterialMap = TS.import(script, game:GetService("shared"), "render", "render.main").getRenderMaterialMap
local actor = script:GetActor()
if not actor then
	error("Actor not found")
end
local rowCalculatedEvent = actor:FindFirstChild("rowCalculated")
if not rowCalculatedEvent then
	error("rowCalculated event not found")
end
local _result = actor
if _result ~= nil then
	_result:BindToMessageParallel(COMPUTE_ROW_MESSAGE, function(message)
		local startTime = tick()
		local imageDimensions = getImageDimensions(message.settings)
		local imageData = generateBufferChannels(message.settings, true)
		message.renderConstants.materialMap = getRenderMaterialMap()
		do
			local col = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					col += 1
				else
					_shouldIncrement = true
				end
				if not (col < imageDimensions.X) then
					break
				end
				local offset = col
				startTime = delayForScriptExhuastion(startTime)
				local pixel = computePixel(Vector2.new(message.row, col), message.settings, message.renderConstants)
				if pixel then
					writePixelToImageBuffer(offset, pixel, imageData)
				end
			end
		end
		rowCalculatedEvent:Fire(imageData)
	end)
end
