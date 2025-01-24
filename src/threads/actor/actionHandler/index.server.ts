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

const actorHelperRequest = script.Parent?.Parent?.FindFirstChild("meshPixel") as BindableEvent

actor?.BindToMessageParallel(COMPUTE_ROW_MESSAGE, (message: ActorMessage) => {
    let startTime = tick()
    const imageDimensions = getImageDimensions(message.settings)
    const imageData = generateBufferChannels(message.settings, true)
    message.renderConstants.materialMap = getRenderMaterialMap() // Update material map to actually use enum instead of stringified versions

    const promises: Promise<void>[] = []
    for (let col = 0; col < imageDimensions.X; col++) {
        const offset = col
        startTime = delayForScriptExhuastion(startTime)
        promises.push( new Promise<void>((success, failure) => {
            computePixel(
                new Vector2(col, message.row),
                message.settings, 
                message.renderConstants,
                actorHelperRequest,
                true
            ).then( pixel => {
                if (pixel) {
                    writePixelToImageBuffer(offset, pixel, imageData)
                }
                success()
            }).catch(() => failure())
        }))
    }
    Promise.allSettled(promises).then(x=>rowCalculatedEvent.Fire(imageData))
})
