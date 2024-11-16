import { RenderConstants } from "shared/render/render.model"
import { ActorMessage, COMPUTE_ROW_MESSAGE } from "./actor.model"
import { computePixel, delayForScriptExhuastion } from "shared/render/render.utils"
import { getImageDimensions } from "shared/utils"
import { generateBufferChannels, writePixelToImageBuffer } from "shared/file/file.utils"

const actor = script.GetActor()

if (!actor) {
    throw "Actor not found"
}
const rowCalculatedEvent = actor.FindFirstChild("rowCalculated") as BindableEvent
if (!rowCalculatedEvent) {
    throw "rowCalculated event not found"
}

actor?.BindToMessageParallel(COMPUTE_ROW_MESSAGE, (message: ActorMessage) => {
    let startTime = tick()
    const imageDimensions = getImageDimensions(message.settings)
    const imageData = generateBufferChannels(message.settings, true)

    for (let col = 0; col < imageDimensions.X; col++) {
        const offset = col
        startTime = delayForScriptExhuastion(startTime)
        const pixel = computePixel(
            new Vector2(message.row, col),
            message.settings, 
            message.renderConstants
        )
        if (pixel) {
            writePixelToImageBuffer(offset, pixel, imageData)
        }
    }
    rowCalculatedEvent.Fire(imageData)
})
