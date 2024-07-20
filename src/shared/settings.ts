import { Settings } from "./settings.model";

export const renderSettings: Settings = {
    corners: {
        topRight: new Vector3(-1024, 200, -1024),
        bottomLeft: new Vector3(1024, 0, 1024)
    },
    resolution: .5
} as const
