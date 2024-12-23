import { Settings } from './settings.model'

export const renderSettings: Settings = {
    corners: {
        topRight: new Vector3(-507, 134, -507),
        bottomLeft: new Vector3(511, -140, 511),
    },
    buildingGroups: [
        {
            name: "Castle Keep",
            instances: [
                game.Workspace.FindFirstChild("Castle Keep") as Instance
            ]
        },
        { 
            name: 'Walls',
            instances: [
                game.Workspace.FindFirstChild("Walls") as Instance
            ]
        },
        { 
            name: 'Buildings',
            instances: [
                game.Workspace.FindFirstChild("Buildings") as Instance
            ]
        },
        { 
            name: 'Trees',
            instances: [
                game.Workspace.FindFirstChild("Foliage") as Instance
            ]
        }
    ],
    roadGroups: [
        { 
            name: 'Cobblestone',
            materials: [
                Enum.Material.Cobblestone,
            ],
            onlyTerrain: true
        }
    ],
    resolution: 1,
    samples: 0,
    actorCount: 50
} as const
