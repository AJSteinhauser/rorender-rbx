--!strict
-- src/RoRenderSettings/init.luau

--- Defines the structure of the configuration settings used by the renderer.
export type Settings = {
    terrain: { Instance },
    water: StructureGrouping,
    buildingGroups: { StructureGrouping },
    roadGroups: { StructureGrouping },
    samples: number,
    mapScale: Vector3,
    mapCFrame: CFrame,
    resolution: number,
    shadows: ShadowSettings,
    actors: number
}

--- Defines a grouping of structures for rendering purposes.
export type StructureGrouping = {
    name: string,
    materials: { Enum.Material }?,
    instances: { Instance }?,
    onlyTerrain: boolean?,
}

--- Defines the shadow rendering settings.
export type ShadowSettings = {
    enabled: boolean,
    sunDirection: Vector3,
    darkness: number,
}

-- Reference to the target box object in the scene.
local boxTarget = script.box.center

-- Configuration settings for the renderer.
local settings: Settings = {
    mapScale = boxTarget.mesh.Scale,
    mapCFrame = boxTarget.CFrame,
    resolution = 1,

    terrain = {
        game.Workspace.Terrain,
    },
    water = {
        name = "Water Elements",
        instances = {
            -- If you use BasePart(s) for water include them here 
        },
        onlyTerrain = true, -- Useful if you want to specify a material that is the road material but you only want terrain (non-parts) to be used
        materials = {Enum.Material.Water}
    },
    buildingGroups = {
        {
            name = "Building Group A",
            instances = {
                -- Add building instances here.
                -- The renderer will process all descendant instances of these buildings.
            },
        },
    },

    roadGroups = {
        {
            name = "Road Group A",
            instances = {
                -- Add road instances here.
                -- The renderer will process all descendant instances of these roads.
            },
            onlyTerrain = false, -- Set to true to only include terrain-based materials.
            materials = {},
        },
    },

    samples = 0, -- Number of samples used for rendering calculations.

    shadows = {
        enabled = false, -- Shadows are disabled by default for better performance.
        sunDirection = game:GetService("Lighting"):GetSunDirection(),
        darkness = 0.3, -- Areas in shadow will appear 30% darker.
    },

    actors = 50  -- # of actors process spawned (turn down if you are using an under powered machine / experience plugin crashes)
}

return settings
