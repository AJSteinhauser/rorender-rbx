/// <reference types="@rbxts/testez/globals" />

import { ensureImageLessThanMaxSize } from "./utils"
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
    describe("ensureImageLessThanMaxSize", () => {
        it("should not throw for an image within the recommended size", () => {
            const settings = buildTestSettings(1000, 1000)
            expect(() => ensureImageLessThanMaxSize(settings)).never.to.throw()
        })

        it("should warn instead of throw for an oversized image", () => {
            // Comfortably past the ~7000x7000px soft-warn threshold; this is
            // a pure arithmetic check (no buffer allocation), so it's safe
            // to exercise at this scale in a test.
            const settings = buildTestSettings(20000, 20000)
            expect(() => ensureImageLessThanMaxSize(settings)).never.to.throw()
        })
    })
}
