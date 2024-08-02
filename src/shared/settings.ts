import { Settings } from "./settings.model";

export const renderSettings: Settings = {
    corners: {
        topRight: new Vector3(-1024, 100, -1024),
        bottomLeft: new Vector3(1024, -100, 1024)
    },
    resolution: .5,
    samples: 10
} as const
