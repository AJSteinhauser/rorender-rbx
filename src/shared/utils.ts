import { Pixel } from './render/render.model'
import { Settings } from './settings/settings.model'

export const HTTPS_BODY_LIMIT = 1024 * 1000 - 1 // 1024Kb - 2
export const HEADER_DATA_SIZE = 6 // 3 of 2byte u16int values

export function getImageDimensions(settings: Settings): Vector2 {
    return new Vector2(
        math.floor(math.abs(settings.corners.bottomLeft.X - settings.corners.topRight.X) * settings.resolution),
        math.floor(math.abs(settings.corners.bottomLeft.Z - settings.corners.topRight.Z) * settings.resolution),
    )
}

function writeBufferHeader(buf: buffer, imageSize: Vector2): void {
    buffer.writeu16(buf, 0, 1) // Version 1
    buffer.writeu16(buf, 2, imageSize.X) // Version 1
    buffer.writeu16(buf, 4, imageSize.Y) // Version 1
}

export function convertImageToString(image: Pixel[], imageDimensions: Vector2): string {
    const buf = buffer.create(image.size() * 4 + HEADER_DATA_SIZE)
    writeBufferHeader(buf, imageDimensions)

    for (let i = 0; i < image.size(); i++) {
        const base = i * 4 + HEADER_DATA_SIZE
        buffer.writeu8(buf, base, image[i].r)
        buffer.writeu8(buf, base + 1, image[i].g)
        buffer.writeu8(buf, base + 2, image[i].b)
        buffer.writeu8(buf, base + 3, image[i].h)
    }
    return buffer.tostring(buf)
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
