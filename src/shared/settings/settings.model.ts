export interface Settings {
    mapScale: Vector3
    mapCFrame: CFrame
    resolution: number
    terrain: Instance[]
    buildingGroups: StructureGrouping[]
    roadGroups: StructureGrouping[]
    samples: number
}


export interface StructureGrouping {
    name: string
    materials?: Enum.Material[]
    instances?: Instance[]
    onlyTerrain?: boolean
}
