export interface Settings {
    mapScale: Vector3
    mapCFrame: CFrame
    resolution: number
    terrain: Instance[]
    buildingGroups: StructureGrouping[]
    roadGroups: StructureGrouping[]
    samples: number
    shadows: {
        enabled: boolean
        sunDirection: Vector3
    }
}


export interface StructureGrouping {
    name: string
    materials?: Enum.Material[]
    instances?: Instance[]
    onlyTerrain?: boolean
}
