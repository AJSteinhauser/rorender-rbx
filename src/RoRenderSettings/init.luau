--!strict
--src/RoRenderSettings/init.luau

export type Settings = {
    terrain: { Instance },
    buildingGroups: { StructureGrouping },
    roadGroups: { StructureGrouping },
    samples: number,
    mapScale: Vector3,
    mapCFrame: CFrame,
    resolution: number,
}

export type StructureGrouping = {
    name: string,
    materials: { Enum.Material }?,
    instances: { Instance }?,
    onlyTerrain: boolean?,
}

local boxTargeting = script.box.center

return {
    mapScale = script.box.center.mesh.Scale,
    mapCFrame = script.box.center.CFrame,
    resolution = 1,
    terrain = {
        game.Workspace.Terrain
    },
    buildingGroups = {
        {
            name = "Building Group A",
            instances = {
                -- Put all of the buildings in groups instances here
                -- The building will check all decendent instances of the building instances provided here.
            },
        }
    },
    roadGroups = {
        {
            name = "Road Group A",
            instances = {
                -- Put all of the roads in groups instances here
                -- The renderer will check all decendent instances of the road instances provided here.
            },
            onlyTerrain = false, -- Useful if you want to specify a material that is the road material but you only want terrain (non-parts) to be used
            materials = {}
        }
    },
    samples = 1,
} :: Settings
