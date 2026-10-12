import { ImageBuffers } from "shared/file/file.modal"

const WATER_OPACITY = 0.7

export function applyWaterOverlay(
    output: Pick<ImageBuffers, "red" | "green" | "blue" | "water">,
    pixelCount: number
): void {
    const waterColor = game.Workspace.Terrain.WaterColor
    for (let i = 0; i < pixelCount; i++) {
        if (buffer.readu8(output.water, i) > 0) {
            buffer.writeu8(
                output.red,
                i,
                math.floor(
                    (1 - WATER_OPACITY) * buffer.readu8(output.red, i) +
                        WATER_OPACITY * waterColor.R * 255
                )
            )
            buffer.writeu8(
                output.green,
                i,
                math.floor(
                    (1 - WATER_OPACITY) * buffer.readu8(output.green, i) +
                        WATER_OPACITY * waterColor.G * 255
                )
            )
            buffer.writeu8(
                output.blue,
                i,
                math.floor(
                    (1 - WATER_OPACITY) * buffer.readu8(output.blue, i) +
                        WATER_OPACITY * waterColor.B * 255
                )
            )
        }
    }
}

export function overlayWaterColor(color: Vector3): Vector3 {
    const waterColor = game.Workspace.Terrain.WaterColor
    return color
        .mul(1 - WATER_OPACITY)
        .add(
            new Vector3(waterColor.R, waterColor.G, waterColor.B).mul(
                WATER_OPACITY
            )
        )
}
