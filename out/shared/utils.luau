-- Compiled with roblox-ts v3.0.0
local HTTPS_BODY_LIMIT = 1024 * 1000 - 1
local HEADER_DATA_SIZE = 6
local function getImageDimensions(settings)
	return Vector2.new(math.floor(math.abs(settings.corners.bottomLeft.X - settings.corners.topRight.X) * settings.resolution), math.floor(math.abs(settings.corners.bottomLeft.Z - settings.corners.topRight.Z) * settings.resolution))
end
local function splitImageIntoChunks(image, chunkSize)
	if chunkSize == nil then
		chunkSize = HTTPS_BODY_LIMIT
	end
	local chunks = {}
	local pointer = 0
	while pointer <= #image do
		local startPos = pointer + 1
		local endPos = pointer + chunkSize
		local _arg0 = string.sub(image, startPos, endPos)
		table.insert(chunks, _arg0)
		pointer += chunkSize
	end
	return chunks
end
local function color3ToVector3(color)
	return Vector3.new(color.R, color.G, color.B)
end
return {
	getImageDimensions = getImageDimensions,
	splitImageIntoChunks = splitImageIntoChunks,
	color3ToVector3 = color3ToVector3,
	HTTPS_BODY_LIMIT = HTTPS_BODY_LIMIT,
	HEADER_DATA_SIZE = HEADER_DATA_SIZE,
}
