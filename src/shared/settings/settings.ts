import { Settings } from './settings.model'

export const renderSettings: Settings = {
    corners: {
        topRight: new Vector3(-500, 100, -500),
        bottomLeft: new Vector3(500, -100, 500),
    },
    resolution: 1,
    samples: 1,
} as const
