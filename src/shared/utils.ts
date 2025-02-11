import uiConstants from 'ui/ui-constants';
import { Pixel } from './render/render.model'
import { Settings } from './settings/settings.model'

const TEXT_SIZE = uiConstants.fontSizeNormal; // Default text size (adjust if necessary)
const FONT = uiConstants.boldFont; // Default font (change based on usage)
const FRAME_SIZE = new Vector2(200, 50); // Default frame size
export const HTTPS_BODY_LIMIT = 1024 * 1000 - 1 // 1024Kb - 2
export const HEADER_DATA_SIZE = 6 // 3 of 2byte u16int values
const MAX_IMAGE_SIZE = 7000 * 7000 * 8
export const MAX_PIXEL_SIZE = math.floor(math.sqrt((MAX_IMAGE_SIZE / 8)))

const SIZE_ERROR_MESSAGE = `Current max image size is ${string.format("%.2fGB", MAX_IMAGE_SIZE / 1000000000)}GB, or ${MAX_PIXEL_SIZE}px x ${MAX_PIXEL_SIZE}px. If your use case requires a larger image, please make a feature request at rorender.com/support. In the meantime consider tiling your map into smaller chunks to achieve desired resolution.`

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

export function firstLetterUppercase(word: string): string { 
    return string.sub(word, 0, 1).upper() + string.sub(word, 2)
}

export function getTextSize(text: string, Max?: Vector2): Vector2 {
    const size = game.GetService("TextService").GetTextSize(text, TEXT_SIZE, FONT, Max ?? FRAME_SIZE);
    return new Vector2(math.ceil(size.X), math.ceil(size.Y)).add(Vector2.one);
}

export function findString(query: string, target: string): boolean {
    if (query === '') {
        return true;
    }

	query = string.lower(query);
    target = string.lower(target);
    
    const result = target.find(query)
    return result[0] !== undefined
}