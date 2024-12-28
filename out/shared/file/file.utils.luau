-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
local _file_modal = TS.import(script, game:GetService("shared"), "file", "file.modal")
local FILE_FORMAT_DATA_ORDER = _file_modal.FILE_FORMAT_DATA_ORDER
local HEADER_DATA_SIZE = _file_modal.HEADER_DATA_SIZE
local RORENDER_FILE_VERSION = _file_modal.RORENDER_FILE_VERSION
local STRING_ENCODING_SEPERATOR = _file_modal.STRING_ENCODING_SEPERATOR
local getImageDimensions = TS.import(script, game:GetService("shared"), "utils").getImageDimensions
local function writeHeader(imageSize)
	local buf = buffer.create(HEADER_DATA_SIZE)
	buffer.writeu16(buf, 0, RORENDER_FILE_VERSION)
	buffer.writeu16(buf, 2, imageSize.X)
	buffer.writeu16(buf, 4, imageSize.Y)
	return buf
end
local function generateStringEncodings(settings)
	local _exp = Enum.Material:GetEnumItems()
	-- ▼ ReadonlyArray.map ▼
	local _newValue = table.create(#_exp)
	local _callback = function(x)
		return x.Name
	end
	for _k, _v in _exp do
		_newValue[_k] = _callback(_v, _k - 1, _exp)
	end
	-- ▲ ReadonlyArray.map ▲
	local materials = table.concat(_newValue, ",")
	local _exp_1 = settings.buildingGroups
	-- ▼ ReadonlyArray.map ▼
	local _newValue_1 = table.create(#_exp_1)
	local _callback_1 = function(x)
		return x.name
	end
	for _k, _v in _exp_1 do
		_newValue_1[_k] = _callback_1(_v, _k - 1, _exp_1)
	end
	-- ▲ ReadonlyArray.map ▲
	local buildingGroups = table.concat(_newValue_1, ",")
	local _exp_2 = settings.roadGroups
	-- ▼ ReadonlyArray.map ▼
	local _newValue_2 = table.create(#_exp_2)
	local _callback_2 = function(x)
		return x.name
	end
	for _k, _v in _exp_2 do
		_newValue_2[_k] = _callback_2(_v, _k - 1, _exp_2)
	end
	-- ▲ ReadonlyArray.map ▲
	local roadGroups = table.concat(_newValue_2, ",")
	local output = `{materials}{STRING_ENCODING_SEPERATOR}` .. `{buildingGroups}{STRING_ENCODING_SEPERATOR}` .. `{roadGroups}`
	return buffer.fromstring(output)
end
local generateBufferChannels = function(settings, isRow)
	if isRow == nil then
		isRow = false
	end
	local imageSize = getImageDimensions(settings)
	local bytesPerChannel = if isRow then imageSize.X else imageSize.X * imageSize.Y
	if bytesPerChannel * 8 > 1073741824 then
		warn("Current max image size is 1GB, or 11,585px x 11,585px. If your use case requires a larger image, please make a feature request at rorender.com/support. In the meantime consider tiling your map into smaller chunks to achieve desired resolution.")
		error("Image too large")
	end
	return {
		red = buffer.create(bytesPerChannel),
		green = buffer.create(bytesPerChannel),
		blue = buffer.create(bytesPerChannel),
		height = buffer.create(bytesPerChannel),
		material = buffer.create(bytesPerChannel),
		roads = buffer.create(bytesPerChannel),
		buildings = buffer.create(bytesPerChannel),
		water = buffer.create(bytesPerChannel),
		materialsEncoding = generateStringEncodings(settings),
	}
end
local writePixelToImageBuffer = function(offset, pixel, imageBuffers)
	buffer.writeu8(imageBuffers.red, offset, pixel.r)
	buffer.writeu8(imageBuffers.green, offset, pixel.g)
	buffer.writeu8(imageBuffers.blue, offset, pixel.b)
	buffer.writeu8(imageBuffers.height, offset, pixel.h)
	buffer.writeu8(imageBuffers.material, offset, pixel.material)
	buffer.writeu8(imageBuffers.roads, offset, pixel.road)
	buffer.writeu8(imageBuffers.buildings, offset, pixel.building)
	buffer.writeu8(imageBuffers.water, offset, pixel.water)
end
local getFileSizeFromBuffers = function(imageBuffers)
	local output = 0
	for _, key in FILE_FORMAT_DATA_ORDER do
		output += buffer.len(imageBuffers[key])
	end
	return output
end
local mergeImageBuffersIntoSingleBuffer = function(imageData)
	local totalSize = getFileSizeFromBuffers(imageData)
	local output = buffer.create(totalSize)
	local currentOffset = 0
	for _, item in FILE_FORMAT_DATA_ORDER do
		buffer.copy(output, currentOffset, imageData[item], 0, buffer.len(imageData[item]))
		currentOffset += buffer.len(imageData[item])
	end
	return output
end
return {
	writeHeader = writeHeader,
	generateBufferChannels = generateBufferChannels,
	writePixelToImageBuffer = writePixelToImageBuffer,
	mergeImageBuffersIntoSingleBuffer = mergeImageBuffersIntoSingleBuffer,
}
