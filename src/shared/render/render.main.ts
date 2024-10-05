import { Settings } from 'shared/settings/settings.model'
import { RenderConstants } from './render.model'
import { computePixel, delayForScriptExhuastion } from './render.utils'
import { getImageDimensions } from 'shared/utils'
import { generateBufferChannels } from 'shared/file/file.utils'
import { ImageBuffers } from 'shared/file/file.modal'
import { writePixelToImageBuffer } from 'shared/file/file.utils'


export function render(settings: Settings): ImageBuffers {
    const imageData = generateBufferChannels(settings)
    const imageDimensions = getImageDimensions(settings)

    const renderConstants = getRenderConstants(settings, imageDimensions)

    let startTime = tick()

    for (let row = 0; row < imageDimensions.Y; row++) {
        for (let col = 0; col < imageDimensions.X; col++) {
            const offset = row * imageDimensions.X + col
            startTime = delayForScriptExhuastion(startTime)
            const pixel = computePixel(new Vector2(row, col), settings, renderConstants)
            if (pixel) {
                writePixelToImageBuffer(offset, pixel, imageData)
            }
        }
    }
    return imageData
}

function getRenderMaterialMap(): Map<number, number> {
    const materials = Enum.Material.GetEnumItems()
    const materialMap = new Map<number, number>()
    materials.forEach((material, index: number) => {
        materialMap.set(material.Value, index)
    })
    return materialMap
}


function getRenderConstants(settings: Settings, imageDimensions: Vector2): RenderConstants {
    const rayLength = math.abs(settings.corners.topRight.Y - settings.corners.bottomLeft.Y)

    const rayBottom = settings.corners.topRight.Y - rayLength
    const normalizedRayTop = settings.corners.topRight.Y - rayBottom

    const materialMap = getRenderMaterialMap()

    return {
        rayLength,
        imageDimensions,
        xSpacing: math.abs(settings.corners.bottomLeft.X - settings.corners.topRight.X) / imageDimensions.X,
        ySpacing: math.abs(settings.corners.bottomLeft.Z - settings.corners.topRight.Z) / imageDimensions.Y,
        rayVector: new Vector3(0, -1, 0).mul(rayLength),
        rayBottom,
        normalizedRayTop,
        materialMap,
    }
}

