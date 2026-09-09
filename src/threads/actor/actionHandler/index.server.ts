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
import {
    ActorMessage,
    COMPUTE_ROW_MESSAGE,
    SET_HEIGHT_PREPASS_MESSAGE
} from "shared/render/actor.model"
import {
    RasterChannel,
    RASTER_CHANNEL_ORDER,
    RleRow
} from "shared/file/file.modal"
import { HeightPrepassGrid, Pixel } from "shared/render/render.model"
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

interface RleChannelState {
    output: ScalingBuffer
    currentValue: number
    runLength: number
}

const newRleChannelState = (): RleChannelState => ({
    output: new ScalingBuffer(),
    currentValue: 0,
    runLength: 0
})

const pushRleValue = (state: RleChannelState, value: number): void => {
    if (state.runLength === 0) {
        state.currentValue = value
        state.runLength = 1
        return
    }
    if (value === state.currentValue && state.runLength < MAX_RUN_LENGTH) {
        state.runLength++
        return
    }
    state.output.push_u16(state.runLength)
    state.output.push_u8(state.currentValue)
    state.currentValue = value
    state.runLength = 1
}

const finishRleValue = (state: RleChannelState): buffer => {
    if (state.runLength > 0) {
        state.output.push_u16(state.runLength)
        state.output.push_u8(state.currentValue)
    }
    return state.output.getBuffer()
}

let cachedHeightPrepass: HeightPrepassGrid | undefined

actor?.BindToMessage(SET_HEIGHT_PREPASS_MESSAGE, (grid: HeightPrepassGrid) => {
    cachedHeightPrepass = grid
})

actor?.BindToMessage(COMPUTE_ROW_MESSAGE, (message: ActorMessage) => {
    let startTime = tick()
    const imageDimensions = getImageDimensions(message.settings)
    message.renderConstants.materialMap = getRenderMaterialMap() // Update material map to actually use enum instead of stringified versions
    message.renderConstants.heightPrepass = cachedHeightPrepass

    const textureSpots: Vector2[] = []

    const imageData = message.encodeOnRow
        ? undefined
        : generateBufferChannels(message.settings, true)
    const encoders = message.encodeOnRow
        ? RASTER_CHANNEL_ORDER.map((channel) => ({
              channel,
              state: newRleChannelState()
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
            for (let e = 0; e < encoders.size(); e++) {
                const entry = encoders[e]
                pushRleValue(
                    entry.state,
                    resolvedPixel
                        ? channelValueOf(resolvedPixel, entry.channel)
                        : 0
                )
            }
        } else if (pixel && pixel !== "texture" && imageData) {
            writePixelToImageBuffer(col, pixel, imageData)
        }
    }

    actorHelperRequest.Fire(textureSpots)

    if (encoders) {
        const rleRow = {} as RleRow
        encoders.forEach(({ channel, state }) => {
            rleRow[channel] = finishRleValue(state)
        })
        rowCalculatedEvent.Fire(rleRow)
    } else {
        rowCalculatedEvent.Fire(imageData)
    }
})
