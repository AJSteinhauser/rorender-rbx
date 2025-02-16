export default `--!strict
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
}

--- Defines a grouping of structures for rendering purposes.
export type StructureGrouping = {
    name: string,
    materials: { Enum.Material }?,
    instances: { Instance | string }?,
    onlyTerrain: boolean?,
}

--- Defines the shadow rendering settings.
export type ShadowSettings = {
    enabled: boolean,
    sunDirection: Vector3,
    darkness: number,
}

-- Reference to the target box object in the scene.
local boxTarget = workspace.RoRenderSettings.box.center

-- Configuration settings for the renderer.`;