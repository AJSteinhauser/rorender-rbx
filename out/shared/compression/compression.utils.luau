-- Compiled with roblox-ts v3.0.0
local getCharByteValue = function(char)
	return (string.byte(char))
end
local function to32BitBinaryString(value)
	-- Ensure the number is treated as an unsigned 32-bit integer
	local unsignedValue = bit32.rshift(value, 0)
	local binaryString = ""
	for i = 31, 0, -1 do
		local bit = if (bit32.band(unsignedValue, (bit32.lshift(1, i)))) ~= 0 then "1" else "0"
		binaryString ..= bit
	end
	return binaryString
end
return {
	to32BitBinaryString = to32BitBinaryString,
	getCharByteValue = getCharByteValue,
}
