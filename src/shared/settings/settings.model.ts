export interface Settings {
    corners: {
        topRight: Vector3
        bottomLeft: Vector3
    }
    terrain: Instance[]
    buildingGroups: StructureGrouping[]
    roadGroups: StructureGrouping[]
    samples: number
    resolution: number
    actorCount: number
}


export interface StructureGrouping {
    name: string
    materials?: Enum.Material[]
    instances?: Instance[]
    onlyTerrain?: boolean
}
