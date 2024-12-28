-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
--/ <reference types="@rbxts/testez/globals" />
local _run_length_encoding_compression = TS.import(script, game:GetService("shared"), "compression", "run-length", "run-length-encoding.compression")
local runLengthDecode = _run_length_encoding_compression.runLengthDecode
local runLengthEncode = _run_length_encoding_compression.runLengthEncode
return function()
	describe("Simple 1 char run length encoding", function()
		local testString = "A"
		local input = buffer.create(1)
		buffer.writeu8(input, 0, (string.byte(testString)))
		local output = buffer.create(3)
		buffer.writeu16(output, 0, 1)
		buffer.writeu8(output, 2, (string.byte(testString)))
		it("should encode string", function()
			expect(buffer.tostring(runLengthEncode(input))).to.equal(buffer.tostring(output))
		end)
		it("should decode string", function()
			expect(buffer.tostring(runLengthDecode(output))).to.equal(buffer.tostring(input))
		end)
	end)
	describe("Complicated binary string", function()
		local testString = "AABBBBBAAABCABA"
		it("should encode and decode buffer to same string", function()
			expect(buffer.tostring(runLengthDecode(runLengthEncode(buffer.fromstring(testString))))).to.equal(testString)
		end)
	end)
end
