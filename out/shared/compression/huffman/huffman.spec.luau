-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
--/ <reference types="@rbxts/testez/globals" />
local getCharByteValue = TS.import(script, game:GetService("shared"), "compression", "compression.utils").getCharByteValue
local _huffman_encoding_compression = TS.import(script, game:GetService("shared"), "compression", "huffman", "huffman-encoding.compression")
local buildEncodingMap = _huffman_encoding_compression.buildEncodingMap
local buildTreeFromFrequencyTable = _huffman_encoding_compression.buildTreeFromFrequencyTable
local huffmanDecode = _huffman_encoding_compression.huffmanDecode
local generatePriorityQueue = _huffman_encoding_compression.generatePriorityQueue
local huffmanEncode = _huffman_encoding_compression.huffmanEncode
local writeTreeToBuffer = _huffman_encoding_compression.writeTreeToBuffer
local TEST_STRING = "AABBBBBAAABCCAAD"
local checkTreesAreEqual
checkTreesAreEqual = function(tree1, tree2)
	if tree1 == nil and tree2 == nil then
		return true
	elseif (tree1 == nil) ~= (tree2 == nil) then
		return false
	end
	if not tree1 or not tree2 then
		return false
	end
	if (tree1.frequency ~= tree2.frequency) ~= (tree1.symbol ~= tree2.symbol) then
		return false
	else
		return checkTreesAreEqual(tree1.left, tree2.left) and checkTreesAreEqual(tree1.right, tree2.right)
	end
end
return function()
	describe("tree storage", function()
		local frequencyTable = generatePriorityQueue(buffer.fromstring(TEST_STRING))
		local huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
		local tree = writeTreeToBuffer(huffmanTree)
		it("should write the size of the tree as the first 16bits of the table", function()
			expect(buffer.readu16(tree, 0)).to.equal(15)
		end)
	end)
	describe("frequency table", function()
		local expectedFrequencyTable = { {
			frequency = 7,
			symbol = getCharByteValue("A"),
		}, {
			frequency = 6,
			symbol = getCharByteValue("B"),
		}, {
			frequency = 2,
			symbol = getCharByteValue("C"),
		}, {
			frequency = 1,
			symbol = getCharByteValue("D"),
		} }
		it("should build a frequncy table that matches expected output", function()
			local _exp = generatePriorityQueue(buffer.fromstring(TEST_STRING))
			-- ▼ ReadonlyArray.forEach ▼
			local _callback = function(node, index)
				expect(node.frequency).to.equal(expectedFrequencyTable[index + 1].frequency)
				expect(node.symbol).to.equal(expectedFrequencyTable[index + 1].symbol)
			end
			for _k, _v in _exp do
				_callback(_v, _k - 1, _exp)
			end
			-- ▲ ReadonlyArray.forEach ▲
		end)
		it("should build a priority queue with a length equal to the number of symbols", function()
			expect(#generatePriorityQueue(buffer.fromstring(TEST_STRING))).to.equal(4)
		end)
	end)
	describe("huffman tree", function()
		local expectedHuffmanTree = {
			frequency = 16,
			right = {
				frequency = 7,
				symbol = getCharByteValue("A"),
			},
			left = {
				frequency = 9,
				left = {
					frequency = 6,
					symbol = getCharByteValue("B"),
				},
				right = {
					frequency = 3,
					left = {
						frequency = 2,
						symbol = getCharByteValue("C"),
					},
					right = {
						frequency = 1,
						symbol = getCharByteValue("D"),
					},
				},
			},
		}
		local frequencyTable = generatePriorityQueue(buffer.fromstring(TEST_STRING))
		local huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
		it("should build a huffman tree that matches expected output", function()
			expect(checkTreesAreEqual(expectedHuffmanTree, huffmanTree)).to.equal(true)
		end)
	end)
	describe("huffman table", function()
		local frequencyTable = generatePriorityQueue(buffer.fromstring(TEST_STRING))
		local huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
		local huffmanTable = buildEncodingMap(huffmanTree)
		local expectedHuffmanTable = {}
		local _arg0 = getCharByteValue("A")
		expectedHuffmanTable[_arg0] = {
			binaryValue = 0b1,
			bitLength = 1,
		}
		local _arg0_1 = getCharByteValue("B")
		expectedHuffmanTable[_arg0_1] = {
			binaryValue = 0b00,
			bitLength = 2,
		}
		local _arg0_2 = getCharByteValue("C")
		expectedHuffmanTable[_arg0_2] = {
			binaryValue = 0b010,
			bitLength = 3,
		}
		local _arg0_3 = getCharByteValue("D")
		expectedHuffmanTable[_arg0_3] = {
			binaryValue = 0b011,
			bitLength = 3,
		}
		it("should encode the huffmen codes to the table", function()
			-- ▼ ReadonlyMap.forEach ▼
			local _callback = function(value, key)
				local _to = expect(value.binaryValue).to
				local _key = key
				local _result = expectedHuffmanTable[_key]
				if _result ~= nil then
					_result = _result.binaryValue
				end
				_to.equal(_result)
				local _to_1 = expect(value.bitLength).to
				local _key_1 = key
				local _result_1 = expectedHuffmanTable[_key_1]
				if _result_1 ~= nil then
					_result_1 = _result_1.bitLength
				end
				_to_1.equal(_result_1)
			end
			for _k, _v in huffmanTable do
				_callback(_v, _k, huffmanTable)
			end
			-- ▲ ReadonlyMap.forEach ▲
		end)
	end)
	describe("huffman encoding", function()
		local huffmanTable = {}
		local _arg0 = getCharByteValue("A")
		huffmanTable[_arg0] = {
			binaryValue = 0b1,
			bitLength = 1,
		}
		local _arg0_1 = getCharByteValue("B")
		huffmanTable[_arg0_1] = {
			binaryValue = 0b00,
			bitLength = 2,
		}
		local _arg0_2 = getCharByteValue("C")
		huffmanTable[_arg0_2] = {
			binaryValue = 0b010,
			bitLength = 3,
		}
		local _arg0_3 = getCharByteValue("D")
		huffmanTable[_arg0_3] = {
			binaryValue = 0b011,
			bitLength = 3,
		}
		it("should encode a single character", function()
			local encoded = huffmanEncode(buffer.fromstring("A"), huffmanTable)
			expect(buffer.readu32(encoded.data, 0)).to.equal(0b10000000000000000000000000000000)
			local test2 = huffmanEncode(buffer.fromstring("C"), huffmanTable)
			expect(buffer.readu32(test2.data, 0)).to.equal(0b01000000000000000000000000000000)
		end)
		it("should encode multiple characters", function()
			local encoded = huffmanEncode(buffer.fromstring("ABA"), huffmanTable)
			expect(buffer.readu32(encoded.data, 0)).to.equal(0b10010000000000000000000000000000)
			local test2 = huffmanEncode(buffer.fromstring("CAB"), huffmanTable)
			expect(buffer.readu32(test2.data, 0)).to.equal(0b01010000000000000000000000000000)
		end)
		it("should encode a single character to the correct bit length", function()
			local encoded = huffmanEncode(buffer.fromstring("A"), huffmanTable)
			expect(encoded.bitLength).to.equal(1)
		end)
		it("should encode the test string", function()
			local encoded = huffmanEncode(buffer.fromstring(TEST_STRING), huffmanTable)
			expect(buffer.readu32(encoded.data, 0)).to.equal(0b11000000000011100010010110110000)
		end)
		it("should encode the correct bit length", function()
			local encoded = huffmanEncode(buffer.fromstring(TEST_STRING), huffmanTable)
			expect(encoded.bitLength).to.equal(28)
		end)
		it("should encode 1 bit overflowing strings", function()
			local testString = string.rep("A", 64)
			local encoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
			for i = 0, 1 do
				expect(buffer.readu32(encoded.data, i * 4)).to.equal(0xFFFFFFFF)
			end
		end)
		it("should encode 2 bit overflowing strings", function()
			local testString = string.rep("B", 32)
			local encoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
			for i = 0, 1 do
				expect(buffer.readu32(encoded.data, i * 4)).to.equal(0x00000000)
			end
		end)
		it("should encode 3 bit single char string", function()
			local testString = string.rep("C", 1)
			local encoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
			expect(buffer.readu32(encoded.data, 0)).to.equal(0b01000000000000000000000000000000)
		end)
		it("should encode 3 bit repeating char overflowing string", function()
			local testString = string.rep("C", 13)
			local encoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
			expect(buffer.readu32(encoded.data, 0)).to.equal(0b01001001001001001001001001001001)
			expect(buffer.readu32(encoded.data, 4)).to.equal(0b00100100000000000000000000000000)
		end)
	end)
	describe("huffman encoding and decoding complicated", function()
		local frequencyTable = generatePriorityQueue(buffer.fromstring(TEST_STRING))
		local huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
		local huffmanTable = buildEncodingMap(huffmanTree)
		it("should work on a long string", function()
			it("should encode and decode to the same value", function()
				local testString = string.rep("A", 31) .. "C"
				local encoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
				local decoded = huffmanDecode(encoded.data, encoded.bitLength, huffmanTree)
				local output = buffer.tostring(decoded)
				expect(output).to.equal(testString)
			end)
		end)
		it("should work on a long random string", function()
			local testString = ""
			local rand = Random.new()
			for i = 0, 999 do
				testString ..= string.char(rand:NextInteger(65, 68))
			end
			local encoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
			local decoded = huffmanDecode(encoded.data, encoded.bitLength, huffmanTree)
			local output = buffer.tostring(decoded)
			expect(output).to.equal(testString)
		end)
	end)
	describe("huffman decoding", function()
		local frequencyTable = generatePriorityQueue(buffer.fromstring(TEST_STRING))
		local huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
		local huffmanTable = buildEncodingMap(huffmanTree)
		it("should decode a single character", function()
			local test1Encoded = huffmanEncode(buffer.fromstring("A"), huffmanTable)
			local test1Decoded = huffmanDecode(test1Encoded.data, test1Encoded.bitLength, huffmanTree)
			expect(buffer.readstring(test1Decoded, 0, 1)).to.equal("A")
			local test2Encoded = huffmanEncode(buffer.fromstring("B"), huffmanTable)
			local test2Decoded = huffmanDecode(test2Encoded.data, test2Encoded.bitLength, huffmanTree)
			expect(buffer.readstring(test2Decoded, 0, 1)).to.equal("B")
			local test3Encoded = huffmanEncode(buffer.fromstring("C"), huffmanTable)
			local test3Decoded = huffmanDecode(test3Encoded.data, test3Encoded.bitLength, huffmanTree)
			expect(buffer.readstring(test3Decoded, 0, 1)).to.equal("C")
		end)
		it("should decode multiple characters", function()
			local test1Encoded = huffmanEncode(buffer.fromstring("AB"), huffmanTable)
			local test1Decoded = huffmanDecode(test1Encoded.data, test1Encoded.bitLength, huffmanTree)
			expect(buffer.readstring(test1Decoded, 0, 2)).to.equal("AB")
			local test2Encoded = huffmanEncode(buffer.fromstring("BAAAB"), huffmanTable)
			local test2Decoded = huffmanDecode(test2Encoded.data, test2Encoded.bitLength, huffmanTree)
			expect(buffer.readstring(test2Decoded, 0, 5)).to.equal("BAAAB")
		end)
		it("should decode the test string", function()
			local testEncoded = huffmanEncode(buffer.fromstring(TEST_STRING), huffmanTable)
			local testDecoded = huffmanDecode(testEncoded.data, testEncoded.bitLength, huffmanTree)
			expect(buffer.readstring(testDecoded, 0, buffer.len(testDecoded))).to.equal(TEST_STRING)
		end)
		it("should decode a long string with 1 bit encoding and buffer overflow", function()
			local testString = string.rep("A", 33)
			local testEncoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
			local testDecoded = huffmanDecode(testEncoded.data, testEncoded.bitLength, huffmanTree)
			local decoded = buffer.readstring(testDecoded, 0, buffer.len(testDecoded))
			expect(decoded).to.equal(testString)
		end)
	end)
end
