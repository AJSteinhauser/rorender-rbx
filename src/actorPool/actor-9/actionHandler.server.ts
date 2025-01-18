import { computePixel, delayForScriptExhuastion } from "shared/render/render.utils"
import { getImageDimensions } from "shared/utils"
import { generateBufferChannels, writePixelToImageBuffer } from "shared/file/file.utils"
import { getRenderMaterialMap } from "shared/render/render.main"
import { ActorMessage, COMPUTE_ROW_MESSAGE } from "shared/render/actor.model"

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
    message.renderConstants.materialMap = getRenderMaterialMap() // Update material map to actually use enum instead of stringified versions

    for (let col = 0; col < imageDimensions.X; col++) {
        const offset = col
        startTime = delayForScriptExhuastion(startTime)
        const pixel = computePixel(
            new Vector2(col, message.row),
            message.settings, 
            message.renderConstants
        )
        if (pixel) {
            writePixelToImageBuffer(offset, pixel, imageData)
        }
    }
    rowCalculatedEvent.Fire(imageData)
})
