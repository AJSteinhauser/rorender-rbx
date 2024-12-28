-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("include"):WaitForChild("RuntimeLib"))
local TestEZ = TS.import(script, game:GetService("include"), "node_modules", "@rbxts", "testez", "src")
local runTests = function()
	TestEZ.TestBootstrap:run({ (game:GetService("ReplicatedStorage")) }, TestEZ.Reporters.TextReporter)
end
return {
	runTests = runTests,
}
