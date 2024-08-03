import { Settings } from 'shared/settings/settings.model'
import { Pixel, RenderConstants } from './render.model'
import { computePixel } from './render.utils'
import { getImageDimensions } from 'shared/utils'
import { generateBufferChannels } from 'shared/file/file.utils'
import { ImageBuffers } from 'shared/file/file.modal'
import { writePixelToImageBuffer } from 'shared/file/file.utils'

const DELAY_TIME = 5

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

function getRenderConstants(settings: Settings, imageDimensions: Vector2): RenderConstants {
    const rayLength = math.abs(settings.corners.topRight.Y - settings.corners.bottomLeft.Y)

    return {
        rayLength,
        imageDimensions,
        xSpacing: math.abs(settings.corners.bottomLeft.X - settings.corners.topRight.X) / imageDimensions.X,
        ySpacing: math.abs(settings.corners.bottomLeft.Z - settings.corners.topRight.Z) / imageDimensions.Y,
        rayVector: new Vector3(0, -1, 0).mul(rayLength),
    }
}

function delayForScriptExhuastion(startTime: number): number {
    if (tick() - startTime > DELAY_TIME) {
        task.wait(0.1)
        return tick()
    } else {
        return startTime
    }
}
