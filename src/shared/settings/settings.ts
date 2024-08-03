import { Settings } from './settings.model'

export const renderSettings: Settings = {
    corners: {
        topRight: new Vector3(-1024, 100, -1024),
        bottomLeft: new Vector3(1024, -100, 1024),
    },
    resolution: 0.5,
    samples: 1,
} as const
