import {
    computePixel,
    delayForScriptExhuastion
} from "shared/render/render.utils"
import { getImageDimensions } from "shared/utils"
import {
    generateBufferChannels,
    writePixelToImageBuffer
} from "shared/file/file.utils"
import { getRenderMaterialMap } from "shared/render/render.main"
import { ActorMessage, COMPUTE_ROW_MESSAGE } from "shared/render/actor.model"
import {
    RasterChannel,
    RASTER_CHANNEL_ORDER,
    RleRow
} from "shared/file/file.modal"
import { Pixel } from "shared/render/render.model"
import { ScalingBuffer } from "shared/compression/autoscaling-buffer.util"
import { MAX_RUN_LENGTH } from "shared/compression/run-length/run-length.model"

const actor = script.GetActor()

if (!actor) {
    throw "Actor not found"
}
const rowCalculatedEvent = actor.FindFirstChild(
    "rowCalculated"
) as BindableEvent
if (!rowCalculatedEvent) {
    throw "rowCalculated event not found"
}

const actorHelperRequest = script.Parent?.Parent?.FindFirstChild(
    "meshPixel"
) as BindableEvent

const channelValueOf = (pixel: Pixel, channel: RasterChannel): number => {
    switch (channel) {
        case "red":
            return pixel.r
        case "green":
            return pixel.g
        case "blue":
            return pixel.b
        case "height":
            return pixel.h
        case "material":
            return pixel.material
        case "roads":
            return pixel.road
        case "buildings":
            return pixel.building
        case "water":
            return pixel.water
    }
}

class RowRunLengthEncoder {
    private output = new ScalingBuffer()
    private currentValue = 0
    private runLength = 0

    public push(value: number): void {
        if (this.runLength === 0) {
            this.currentValue = value
            this.runLength = 1
            return
        }
        if (value === this.currentValue && this.runLength < MAX_RUN_LENGTH) {
            this.runLength++
            return
        }
        this.output.push_u16(this.runLength)
        this.output.push_u8(this.currentValue)
        this.currentValue = value
        this.runLength = 1
    }

    public finish(): buffer {
        if (this.runLength > 0) {
            this.output.push_u16(this.runLength)
            this.output.push_u8(this.currentValue)
        }
        return this.output.getBuffer()
    }
}

actor?.BindToMessage(COMPUTE_ROW_MESSAGE, (message: ActorMessage) => {
    let startTime = tick()
    const imageDimensions = getImageDimensions(message.settings)
    message.renderConstants.materialMap = getRenderMaterialMap() // Update material map to actually use enum instead of stringified versions

    const textureSpots: Vector2[] = []

    const imageData = message.encodeOnRow
        ? undefined
        : generateBufferChannels(message.settings, true)
    const encoders = message.encodeOnRow
        ? RASTER_CHANNEL_ORDER.map((channel) => ({
              channel,
              encoder: new RowRunLengthEncoder()
          }))
        : undefined

    for (let col = 0; col < imageDimensions.X; col++) {
        startTime = delayForScriptExhuastion(startTime)
        const pixel = computePixel(
            new Vector2(col, message.row),
            message.settings,
            message.renderConstants,
            true
        )
        if (pixel === "texture") {
            textureSpots.push(new Vector2(col, message.row))
        }

        if (encoders) {
            const resolvedPixel =
                pixel && pixel !== "texture" ? pixel : undefined
            encoders.forEach(({ channel, encoder }) => {
                encoder.push(
                    resolvedPixel ? channelValueOf(resolvedPixel, channel) : 0
                )
            })
        } else if (pixel && pixel !== "texture" && imageData) {
            writePixelToImageBuffer(col, pixel, imageData)
        }
    }

    actorHelperRequest.Fire(textureSpots)

    if (encoders) {
        const rleRow = {} as RleRow
        encoders.forEach(({ channel, encoder }) => {
            rleRow[channel] = encoder.finish()
        })
        rowCalculatedEvent.Fire(rleRow)
    } else {
        rowCalculatedEvent.Fire(imageData)
    }
})
