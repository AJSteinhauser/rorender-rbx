import { Pixel } from './render/render.model'
import { Settings } from './settings/settings.model'

export const HTTPS_BODY_LIMIT = 1024 * 1000 - 1 // 1024Kb - 2
export const HEADER_DATA_SIZE = 6 // 3 of 2byte u16int values

export function getImageDimensions(settings: Settings): Vector2 {
    return new Vector2(
        math.floor(settings.mapScale.X / settings.resolution),
        math.floor(settings.mapScale.Z / settings.resolution),
    )
}

export function splitImageIntoChunks(image: string, chunkSize: number = HTTPS_BODY_LIMIT): string[] {
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

export function ensureImageLessThanMaxSize(settings: Settings) {
    const imageSize = getImageDimensions(settings)
    const bytesPerChannel = imageSize.X * imageSize.Y * 8
    if (bytesPerChannel * 8 > 1073741824) {
        warn("Current max image size is 1GB, or 11,585px x 11,585px. If your use case requires a larger image, please make a feature request at rorender.com/support. In the meantime consider tiling your map into smaller chunks to achieve desired resolution.")
        throw "Image too large"
    }
}
