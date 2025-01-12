--!strict
--src/RoRenderSettings/init.luau

export type Settings = {
    corners: {
        c0: Vector3,
        c1: Vector3,
    },
    terrain: { Instance },
    buildingGroups: { StructureGrouping },
    roadGroups: { StructureGrouping },
    samples: number,
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
    corners = {
        c0 = boxTargeting.c0.CFrame.Position,
        c1 = boxTargeting.c1.CFrame.Position
    },
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
    resolution = 1,
} :: Settings
