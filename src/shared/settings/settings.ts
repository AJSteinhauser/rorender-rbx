import { Settings } from './settings.model'


export const villageSettings: Settings = {
    corners: {
        topRight: new Vector3(-500, 150, -500),
        bottomLeft: new Vector3(500, -83, 500),
    },
    buildingGroups: [
        { 
            name: 'Structures',
            instances: [
                game.Workspace.FindFirstChild("Structures") as Instance
            ]
        },
        { 
            name: 'Bridge',
            instances: [
                game.Workspace.FindFirstChild("Bridge") as Instance
            ]
        },
        { 
            name: 'Dock',
            instances: [
                game.Workspace.FindFirstChild("Dock") as Instance
            ]
        }
    ],
    roadGroups: [
        { 
            name: 'Main Street',
            materials: [
                Enum.Material.Cobblestone,
            ],
            onlyTerrain: true
        },
        { 
            name: 'Dirt Paths',
            materials: [
                Enum.Material.Mud,
            ],
            onlyTerrain: true
        }
    ],
    resolution: 5,
    samples: 0,
    actorCount: 50
} as const

export const castleSettings: Settings = {
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
