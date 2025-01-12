import { Pixel } from './render/render.model'
import { Settings } from './settings/settings.model'

export const HTTPS_BODY_LIMIT = 1024 * 1000 - 1 // 1024Kb - 2
export const HEADER_DATA_SIZE = 6 // 3 of 2byte u16int values

export function getImageDimensions(settings: Settings): Vector2 {
    return new Vector2(
        math.floor(settings.mapScale.X * settings.resolution),
        math.floor(settings.mapScale.Z * settings.resolution),
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
