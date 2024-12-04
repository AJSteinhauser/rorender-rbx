import { Settings } from './settings.model'

export const renderSettings: Settings = {
    corners: {
        topRight: new Vector3(-500, 200, -500),
        bottomLeft: new Vector3(500, -100, 500),
    },
    resolution: .5,
    samples: 0,
    actorCount: 50
} as const
