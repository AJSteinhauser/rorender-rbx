-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
local _huffman_encoding_compression = TS.import(script, game:GetService("shared"), "compression", "huffman", "huffman-encoding.compression")
local buildEncodingMap = _huffman_encoding_compression.buildEncodingMap
local buildTreeFromFrequencyTable = _huffman_encoding_compression.buildTreeFromFrequencyTable
local generatePriorityQueue = _huffman_encoding_compression.generatePriorityQueue
local huffmanEncode = _huffman_encoding_compression.huffmanEncode
local writeTreeToBuffer = _huffman_encoding_compression.writeTreeToBuffer
local runLengthEncode = TS.import(script, game:GetService("shared"), "compression", "run-length", "run-length-encoding.compression").runLengthEncode
local _file_utils = TS.import(script, game:GetService("shared"), "file", "file.utils")
local mergeImageBuffersIntoSingleBuffer = _file_utils.mergeImageBuffersIntoSingleBuffer
local writeHeader = _file_utils.writeHeader
local render = TS.import(script, game:GetService("shared"), "render", "render.main").render
local villageSettings = TS.import(script, game:GetService("shared"), "settings", "settings").villageSettings
local _utils = TS.import(script, game:GetService("shared"), "utils")
local getImageDimensions = _utils.getImageDimensions
local HTTPS_BODY_LIMIT = _utils.HTTPS_BODY_LIMIT
local splitImageIntoChunks = _utils.splitImageIntoChunks
local runTests = TS.import(script, game:GetService("shared"), "tests", "test-runner").runTests
local httpService = game:GetService("HttpService")
runTests()
local renderSettings = villageSettings
task.wait(2)
render(renderSettings):andThen(function(output)
	local headerBuffer = writeHeader(getImageDimensions(renderSettings))
	local merged = mergeImageBuffersIntoSingleBuffer(output)
	local encoded = runLengthEncode(merged)
	print(getImageDimensions(renderSettings))
	print("\n\n")
	print(string.format("RAW: %.2f KB", buffer.len(merged) / 1000))
	print(string.format("RAW Packets Required: %d", math.ceil(buffer.len(merged) / HTTPS_BODY_LIMIT)))
	print("\n\n")
	print(string.format("RLE compression: %.2f%%", (1 - (buffer.len(encoded) / buffer.len(merged))) * 100))
	print(string.format("RLE: %2.f KB", buffer.len(encoded) / 1000))
	print(string.format("RLE Packets Required: %d", math.ceil(buffer.len(encoded) / HTTPS_BODY_LIMIT)))
	print("\n\n")
	local frequencyTable = generatePriorityQueue(encoded)
	local huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
	local huffmanMap = buildEncodingMap(huffmanTree)
	local huffmanEncoded = huffmanEncode(encoded, huffmanMap)
	print(string.format("Huffman + RLE compression: %.2f%%", (1 - (buffer.len(huffmanEncoded.data) / buffer.len(merged))) * 100))
	print(string.format("Huffman: %2.f KB", buffer.len(huffmanEncoded.data) / 1000))
	print(string.format("Huffman Packets Required: %d", math.ceil(buffer.len(huffmanEncoded.data) / HTTPS_BODY_LIMIT)))
	print("\n\n")
	local treeBuffer = writeTreeToBuffer(huffmanTree)
	-- header -> tree -> data length -> data
	local accumulatedBuffer = buffer.create(buffer.len(headerBuffer) + buffer.len(treeBuffer) + 4 + buffer.len(huffmanEncoded.data))
	buffer.copy(accumulatedBuffer, 0, headerBuffer, 0, buffer.len(headerBuffer))
	buffer.copy(accumulatedBuffer, buffer.len(headerBuffer), treeBuffer, 0, buffer.len(treeBuffer))
	buffer.writeu32(accumulatedBuffer, buffer.len(headerBuffer) + buffer.len(treeBuffer), huffmanEncoded.bitLength)
	buffer.copy(accumulatedBuffer, buffer.len(headerBuffer) + buffer.len(treeBuffer) + 4, huffmanEncoded.data, 0, buffer.len(huffmanEncoded.data))
	print("bit length: " .. tostring(huffmanEncoded.bitLength))
	print(string.format("Final Size : %2.f KB", buffer.len(accumulatedBuffer) / 1000))
	print(string.format("Final Packets Required: %d", math.ceil(buffer.len(accumulatedBuffer) / HTTPS_BODY_LIMIT)))
	local outputData = buffer.tostring(accumulatedBuffer)
	local split = splitImageIntoChunks(outputData)
	-- ▼ ReadonlyArray.forEach ▼
	local _callback = function(chunk, idx)
		task.spawn(function()
			print("sent " .. tostring(idx), "size: " .. tostring(#chunk))
			local response = httpService:PostAsync("https://uploadrenderchunk-izsda2emzq-uc.a.run.app", chunk, Enum.HttpContentType.TextPlain, false, {
				chunkId = tostring(idx),
				totalChunks = tostring(#split),
				pipelineId = "4246a9be-df9b-4cc4-ae8e-d546ae2642ae",
			})
			print(response)
		end)
	end
	for _k, _v in split do
		_callback(_v, _k - 1, split)
	end
	-- ▲ ReadonlyArray.forEach ▲
	print(huffmanTree)
end)
