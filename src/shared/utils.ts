import { Pixel } from "./render/render.model"
import { Settings } from "./settings/settings.model"

export const HTTPS_BODY_LIMIT = 1024 * 1000 - 1 // 1024Kb - 2
export const HEADER_DATA_SIZE = 6 // 3 of 2byte u16int values
export const MAX_PIXEL_SIZE = 25000

const SIZE_ERROR_MESSAGE = `Max image size is ${MAX_PIXEL_SIZE}px x ${MAX_PIXEL_SIZE}px. Modify the resolution value in the RenderSettings ModuleScript to adjust output image size.`

export function getImageDimensions(settings: Settings): Vector2 {
    return new Vector2(
        math.floor(settings.mapScale.X / settings.resolution),
        math.floor(settings.mapScale.Z / settings.resolution)
    )
}

export function splitImageIntoChunks(
    image: string,
    chunkSize: number = HTTPS_BODY_LIMIT
): string[] {
    const chunks = []
    let pointer = 0
    while (pointer <= image.size()) {
        const startPos = pointer + 1
        const endPos = pointer + chunkSize
        chunks.push(string.sub(image, startPos, endPos))
        pointer += chunkSize
    }
    return chunks
}

export function color3ToVector3(color: Color3): Vector3 {
    return new Vector3(color.R, color.G, color.B)
}

export function getImageSizeError(settings: Settings): string | undefined {
    const imageSize = getImageDimensions(settings)
    if (imageSize.X > MAX_PIXEL_SIZE || imageSize.Y > MAX_PIXEL_SIZE) {
        return `Image too large: ${imageSize.X}px x ${imageSize.Y}px. ${SIZE_ERROR_MESSAGE}`
    }
    return undefined
}
