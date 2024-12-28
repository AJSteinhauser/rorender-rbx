-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
local delayForScriptExhuastion = TS.import(script, game:GetService("shared"), "render", "render.utils").delayForScriptExhuastion
local writeBufferBitLength = 31
local EMPTY_NODE_CODE = 256
local NULL_NODE_CODE = 257
local depthFirstTreeArrayBuilder = function(node)
	local output = {}
	local preOrderTraversal
	preOrderTraversal = function(node)
		if not node then
			table.insert(output, NULL_NODE_CODE)
			return nil
		end
		local _arg0 = if node.symbol ~= nil then node.symbol else EMPTY_NODE_CODE
		table.insert(output, _arg0)
		preOrderTraversal(node.left)
		preOrderTraversal(node.right)
	end
	preOrderTraversal(node)
	return output
end
local reconstuctDepthFirstTree = function(data)
	local index = 0
	local function buildTree()
		if index >= #data or data[index + 1] == NULL_NODE_CODE then
			index += 1
			return nil
		end
		local node = {
			symbol = if data[index + 1] <= 255 then data[index + 1] else nil,
		}
		index += 1
		node.left = buildTree()
		node.right = buildTree()
		return node
	end
	local node = buildTree()
	if not node then
		error("Bad tree")
	end
	return node
end
local writeTreeToBuffer = function(node)
	local nodeArray = depthFirstTreeArrayBuilder(node)
	local buf = buffer.create((#nodeArray * 2) + 2)
	buffer.writeu16(buf, 0, #nodeArray)
	for i = 0, #nodeArray - 1 do
		buffer.writeu16(buf, i * 2 + 2, nodeArray[i + 1])
	end
	return buf
end
local huffmanEncode = function(image, encodingMap)
	local bufferStore = {}
	local symbolIdx = 0
	local leftBitIdx = writeBufferBitLength
	local currentBuf = 0
	local currentBufDirty = false
	local bitCounter = 0
	local startTime = tick()
	while symbolIdx < buffer.len(image) do
		startTime = delayForScriptExhuastion(startTime)
		local preOperationSpaceRemaining = leftBitIdx + 1
		local symbol = buffer.readu8(image, symbolIdx)
		local encodingInfo = encodingMap[symbol]
		if not encodingInfo then
			error(`Symbol: {symbol} not found in encoding map`)
		end
		currentBuf = bit32.bor(currentBuf, bit32.lshift(encodingInfo.binaryValue, (leftBitIdx - encodingInfo.bitLength + 1)))
		leftBitIdx -= encodingInfo.bitLength
		currentBufDirty = true
		bitCounter += encodingInfo.bitLength
		if leftBitIdx < 0 then
			local _currentBuf = currentBuf
			table.insert(bufferStore, _currentBuf)
			currentBuf = 0
			local overflowAmount = math.abs(preOperationSpaceRemaining - encodingInfo.bitLength)
			currentBufDirty = false
			leftBitIdx = writeBufferBitLength
			if overflowAmount > 0 then
				currentBuf = bit32.bor(currentBuf, encodingInfo.binaryValue)
				local shiftAmount = writeBufferBitLength - (overflowAmount - 1)
				currentBuf = bit32.lshift(currentBuf, shiftAmount)
				leftBitIdx = writeBufferBitLength - overflowAmount
				currentBufDirty = true
			end
		end
		symbolIdx += 1
	end
	if currentBufDirty then
		local _currentBuf = currentBuf
		table.insert(bufferStore, _currentBuf)
	end
	local output = buffer.create(#bufferStore * 4)
	-- ▼ ReadonlyArray.forEach ▼
	local _callback = function(value, idx)
		startTime = delayForScriptExhuastion(startTime)
		buffer.writeu32(output, idx * 4, value)
	end
	for _k, _v in bufferStore do
		_callback(_v, _k - 1, bufferStore)
	end
	-- ▲ ReadonlyArray.forEach ▲
	return {
		data = output,
		bitLength = bitCounter,
	}
end
local isLeafNode = function(node)
	return not node.left and not node.right
end
local maskOtherBits = function(value, position)
	if position < 0 or position > 31 then
		error(`Invalid position: {position}`)
	end
	local mask = (bit32.lshift(1, position))
	return bit32.band(value, mask)
end
local huffmanDecode = function(image, bitLength, encodingTree)
	local currentTreePos = encodingTree
	local byteIdx = 0
	local overallBitIdx = 0
	local subBitIdx = 31
	local currentBuffer = buffer.readu32(image, byteIdx)
	local output = ""
	local startTime = tick()
	while overallBitIdx < bitLength do
		startTime = delayForScriptExhuastion(startTime)
		local value = maskOtherBits(currentBuffer, subBitIdx)
		overallBitIdx += 1
		subBitIdx -= 1
		if not currentTreePos.left or not currentTreePos.right then
			error(`Invalid tree`)
		end
		if value == 0 then
			currentTreePos = currentTreePos.left
		else
			currentTreePos = currentTreePos.right
		end
		if isLeafNode(currentTreePos) then
			if currentTreePos.symbol == nil then
				error(`Symbol is undefined on a leaf node freq: {currentTreePos.frequency}`)
			end
			output ..= string.char(currentTreePos.symbol)
			currentTreePos = encodingTree
		end
		if subBitIdx < 0 and overallBitIdx < bitLength then
			byteIdx += 4
			currentBuffer = buffer.readu32(image, byteIdx)
			subBitIdx = 31
		end
	end
	local outputBuf = buffer.create(#output)
	buffer.writestring(outputBuf, 0, output, #output)
	return outputBuf
end
local huffmanTreeDepthFirst
local buildEncodingMap = function(node)
	local huffmanMap = {}
	huffmanTreeDepthFirst(node, huffmanMap)
	return huffmanMap
end
huffmanTreeDepthFirst = function(node, map, binaryValue, bitLength)
	if binaryValue == nil then
		binaryValue = 0
	end
	if bitLength == nil then
		bitLength = 0
	end
	local isLeaf = isLeafNode(node)
	local symbol = node.symbol
	if isLeaf and symbol ~= nil then
		local _map = map
		local _arg1 = {
			binaryValue = binaryValue,
			bitLength = bitLength,
		}
		_map[symbol] = _arg1
	end
	if node.left then
		huffmanTreeDepthFirst(node.left, map, bit32.lshift(binaryValue, 1), bitLength + 1)
	end
	if node.right then
		huffmanTreeDepthFirst(node.right, map, bit32.bor(bit32.lshift(binaryValue, 1), 1), bitLength + 1)
	end
end
local addNodeToPriorityQueue
local buildTreeFromFrequencyTable = function(priorityQueue)
	local root = nil
	local deferTime = tick()
	while #priorityQueue > 1 do
		deferTime = delayForScriptExhuastion(deferTime)
		-- ▼ Array.pop ▼
		local _length = #priorityQueue
		local _result = priorityQueue[_length]
		priorityQueue[_length] = nil
		-- ▲ Array.pop ▲
		local right = _result
		-- ▼ Array.pop ▼
		local _length_1 = #priorityQueue
		local _result_1 = priorityQueue[_length_1]
		priorityQueue[_length_1] = nil
		-- ▲ Array.pop ▲
		local left = _result_1
		if left and right then
			root = {
				left = left,
				right = right,
				frequency = left.frequency + right.frequency,
			}
			addNodeToPriorityQueue(root, priorityQueue)
		end
	end
	if not root then
		error("Failed to build huffman tree")
	end
	return root
end
addNodeToPriorityQueue = function(node, priorityQueue)
	local _priorityQueue = priorityQueue
	local _node = node
	table.insert(_priorityQueue, _node)
	table.sort(priorityQueue, function(a, b)
		return a.frequency > b.frequency
	end)
end
local generatePriorityQueue = function(buff)
	local frequencyMap = {}
	local startTime = tick()
	do
		local i = 0
		local _shouldIncrement = false
		while true do
			if _shouldIncrement then
				i += 1
			else
				_shouldIncrement = true
			end
			if not (i < buffer.len(buff)) then
				break
			end
			startTime = delayForScriptExhuastion(startTime)
			local value = buffer.readu8(buff, i)
			local _condition = frequencyMap[value]
			if not (_condition ~= 0 and _condition == _condition and _condition) then
				_condition = 0
			end
			local frequency = _condition
			local _arg1 = frequency + 1
			frequencyMap[value] = _arg1
		end
	end
	local output = {}
	-- ▼ ReadonlyMap.forEach ▼
	local _callback = function(value, key)
		startTime = delayForScriptExhuastion(startTime)
		local _arg0 = {
			frequency = value,
			symbol = key,
		}
		table.insert(output, _arg0)
	end
	for _k, _v in frequencyMap do
		_callback(_v, _k, frequencyMap)
	end
	-- ▲ ReadonlyMap.forEach ▲
	table.sort(output, function(a, b)
		return a.frequency > b.frequency
	end)
	return output
end
return {
	depthFirstTreeArrayBuilder = depthFirstTreeArrayBuilder,
	reconstuctDepthFirstTree = reconstuctDepthFirstTree,
	writeTreeToBuffer = writeTreeToBuffer,
	huffmanEncode = huffmanEncode,
	isLeafNode = isLeafNode,
	maskOtherBits = maskOtherBits,
	huffmanDecode = huffmanDecode,
	buildEncodingMap = buildEncodingMap,
	huffmanTreeDepthFirst = huffmanTreeDepthFirst,
	buildTreeFromFrequencyTable = buildTreeFromFrequencyTable,
	addNodeToPriorityQueue = addNodeToPriorityQueue,
	generatePriorityQueue = generatePriorityQueue,
}
