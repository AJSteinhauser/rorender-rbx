import { Pixel } from './render/render.model'
import { Settings } from './settings/settings.model'

export const HTTPS_BODY_LIMIT = 1024 * 1000 - 1 // 1024Kb - 2
export const HEADER_DATA_SIZE = 6 // 3 of 2byte u16int values
const MAX_IMAGE_SIZE = (1024 ** 3) * 2 // 2 GB
export const MAX_PIXEL_SIZE = math.floor(math.sqrt((MAX_IMAGE_SIZE / 8)))

const SIZE_ERROR_MESSAGE = `Current max image size is 2GB, or ${MAX_PIXEL_SIZE}px x ${MAX_PIXEL_SIZE}px. If your use case requires a larger image, please make a feature request at rorender.com/support. In the meantime consider tiling your map into smaller chunks to achieve desired resolution.`

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
    if (bytesPerChannel > MAX_IMAGE_SIZE) {
        throw `Image too large: ${imageSize}. ${SIZE_ERROR_MESSAGE}`
    }
}
