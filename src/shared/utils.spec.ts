/// <reference types="@rbxts/testez/globals" />

import { getImageSizeError, MAX_PIXEL_SIZE } from "./utils"
import { Settings } from "./settings/settings.model"

const buildTestSettings = (mapScaleX: number, mapScaleZ: number): Settings => ({
    mapScale: new Vector3(mapScaleX, 1, mapScaleZ),
    mapCFrame: new CFrame(),
    resolution: 1,
    terrain: [],
    buildingGroups: [],
    roadGroups: [],
    water: { name: "water" },
    samples: 1,
    shadows: {
        enabled: false,
        sunDirection: new Vector3(0, -1, 0),
        darkness: 0
    },
    actors: 1
})

export = () => {
    describe("getImageSizeError", () => {
        it("should return undefined for an image within the max size", () => {
            const settings = buildTestSettings(MAX_PIXEL_SIZE, MAX_PIXEL_SIZE)
            expect(getImageSizeError(settings)).never.to.be.ok()
        })

        it("should return an error when width exceeds the max size", () => {
            const settings = buildTestSettings(MAX_PIXEL_SIZE + 1, 1000)
            expect(getImageSizeError(settings)).to.be.ok()
        })

        it("should return an error when height exceeds the max size", () => {
            const settings = buildTestSettings(1000, MAX_PIXEL_SIZE + 1)
            expect(getImageSizeError(settings)).to.be.ok()
        })
    })
}
