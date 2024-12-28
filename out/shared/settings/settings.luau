-- Compiled with roblox-ts v3.0.0
local villageSettings = {
	corners = {
		topRight = Vector3.new(-500, 150, -500),
		bottomLeft = Vector3.new(500, -83, 500),
	},
	buildingGroups = { {
		name = "Structures",
		instances = { game.Workspace:FindFirstChild("Structures") },
	}, {
		name = "Bridge",
		instances = { game.Workspace:FindFirstChild("Bridge") },
	}, {
		name = "Dock",
		instances = { game.Workspace:FindFirstChild("Dock") },
	} },
	roadGroups = { {
		name = "Main Street",
		materials = { Enum.Material.Cobblestone },
		onlyTerrain = true,
	}, {
		name = "Dirt Paths",
		materials = { Enum.Material.Mud },
		onlyTerrain = true,
	} },
	resolution = 5,
	samples = 0,
	actorCount = 50,
}
local castleSettings = {
	corners = {
		topRight = Vector3.new(-507, 134, -507),
		bottomLeft = Vector3.new(511, -140, 511),
	},
	buildingGroups = { {
		name = "Castle Keep",
		instances = { game.Workspace:FindFirstChild("Castle Keep") },
	}, {
		name = "Walls",
		instances = { game.Workspace:FindFirstChild("Walls") },
	}, {
		name = "Buildings",
		instances = { game.Workspace:FindFirstChild("Buildings") },
	}, {
		name = "Trees",
		instances = { game.Workspace:FindFirstChild("Foliage") },
	} },
	roadGroups = { {
		name = "Cobblestone",
		materials = { Enum.Material.Cobblestone },
		onlyTerrain = true,
	} },
	resolution = 1,
	samples = 0,
	actorCount = 50,
}
return {
	villageSettings = villageSettings,
	castleSettings = castleSettings,
}
