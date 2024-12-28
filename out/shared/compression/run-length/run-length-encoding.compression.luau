-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
local delayForScriptExhuastion = TS.import(script, game:GetService("shared"), "render", "render.utils").delayForScriptExhuastion
local _run_length_model = TS.import(script, game:GetService("shared"), "compression", "run-length", "run-length.model")
local MAX_RUN_LENGTH = _run_length_model.MAX_RUN_LENGTH
local RUN_LENGTH_BYTE_SIZE = _run_length_model.RUN_LENGTH_BYTE_SIZE
local convertRunLengthSequenceToEncodedBuffer
local runLengthEncode = function(image)
	local idx = 0
	local runs = {}
	local current = buffer.readu8(image, idx)
	local count = 1
	local wastedCount = 0
	local startTime = tick()
	while idx < buffer.len(image) - 1 do
		startTime = delayForScriptExhuastion(startTime)
		local nextValue = buffer.readu8(image, idx + 1)
		if current == nextValue and count < MAX_RUN_LENGTH then
			count += 1
		else
			local _arg0 = {
				value = current,
				length = count,
			}
			table.insert(runs, _arg0)
			if count < 128 then
				wastedCount += 1
			end
			current = nextValue
			count = 1
		end
		idx += 1
	end
	local _arg0 = {
		value = current,
		length = count,
	}
	table.insert(runs, _arg0)
	return convertRunLengthSequenceToEncodedBuffer(runs)
end
local readRunLengthSequence = function(image, idx)
	local length = buffer.readu16(image, idx)
	local value = buffer.readu8(image, idx + 2)
	return {
		length = length,
		value = value,
	}
end
-- Used for testing / validating purposes
local convertRunLengthSequenceToRawBuffer
local runLengthDecode = function(image)
	local idx = 0
	local runs = {}
	local increment = RUN_LENGTH_BYTE_SIZE + 1
	local startTime = tick()
	while idx <= buffer.len(image) - increment do
		startTime = delayForScriptExhuastion(startTime)
		local _arg0 = readRunLengthSequence(image, idx)
		table.insert(runs, _arg0)
		idx += increment
	end
	return convertRunLengthSequenceToRawBuffer(runs)
end
convertRunLengthSequenceToRawBuffer = function(runLengthSequence)
	-- ▼ ReadonlyArray.reduce ▼
	local _result = 0
	local _callback = function(sum, item)
		return sum + item.length
	end
	for _i = 1, #runLengthSequence do
		_result = _callback(_result, runLengthSequence[_i], _i - 1, runLengthSequence)
	end
	-- ▲ ReadonlyArray.reduce ▲
	local count = _result
	local output = buffer.create(count)
	local idx = 0
	local startTime = tick()
	-- ▼ ReadonlyArray.forEach ▼
	local _callback_1 = function(item)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < item.length) then
					break
				end
				startTime = delayForScriptExhuastion(startTime)
				buffer.writeu8(output, idx + i, item.value)
			end
		end
		idx += item.length
	end
	for _k, _v in runLengthSequence do
		_callback_1(_v, _k - 1, runLengthSequence)
	end
	-- ▲ ReadonlyArray.forEach ▲
	return output
end
convertRunLengthSequenceToEncodedBuffer = function(runLengthSequence)
	local output = buffer.create(#runLengthSequence * (RUN_LENGTH_BYTE_SIZE + 1))
	local startTime = tick()
	-- ▼ ReadonlyArray.forEach ▼
	local _callback = function(item, idx)
		startTime = delayForScriptExhuastion(startTime)
		buffer.writeu16(output, idx * (RUN_LENGTH_BYTE_SIZE + 1), item.length)
		buffer.writeu8(output, idx * (RUN_LENGTH_BYTE_SIZE + 1) + 2, item.value)
	end
	for _k, _v in runLengthSequence do
		_callback(_v, _k - 1, runLengthSequence)
	end
	-- ▲ ReadonlyArray.forEach ▲
	return output
end
return {
	runLengthEncode = runLengthEncode,
	readRunLengthSequence = readRunLengthSequence,
	runLengthDecode = runLengthDecode,
	convertRunLengthSequenceToEncodedBuffer = convertRunLengthSequenceToEncodedBuffer,
}
