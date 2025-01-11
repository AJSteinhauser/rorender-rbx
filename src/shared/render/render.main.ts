import { Settings } from 'shared/settings/settings.model'
import { RenderConstants } from './render.model'
import { getImageDimensions } from 'shared/utils'
import { ImageBuffers } from 'shared/file/file.modal'
import { WorkerPool } from './actor-pool.handler'
import { generateBufferChannels } from 'shared/file/file.utils'
import { delayForScriptExhuastion } from './render.utils'
import { ActorMessage, COMPUTE_ROW_MESSAGE } from './actor.model'


export async function render(settings: Settings): Promise<ImageBuffers> {
    const imageDimensions = getImageDimensions(settings)
    const renderConstants = getRenderConstants(settings, imageDimensions)

    const pool = new WorkerPool(settings)

    const calculatedRows: ImageBuffers[] = []
    const allRowsCompleted: Promise<void>[] = []

    let startTime = tick()
    let finishedRows = 0
    let lastRowPrinted = 0
    for (let row = 0; row < imageDimensions.Y; row++) {
        startTime = delayForScriptExhuastion(startTime)
        const actorMessage: ActorMessage = {
            settings,
            row,
            renderConstants
        }
        const rowCompleted = new Promise<void>(async (resolve) => {
            const actor = await pool.getActor(settings)
            const rowCalculatedEvent = actor.FindFirstChild("rowCalculated") as BindableEvent
            const binding = rowCalculatedEvent.Event.Connect((data: ImageBuffers) => {
                startTime = delayForScriptExhuastion(startTime)
                calculatedRows[row] = data
                binding.Disconnect()
                pool.releaseActor(actor)
                finishedRows++
                const currentCompletion = finishedRows / imageDimensions.Y
                if (currentCompletion - lastRowPrinted > 0.01) {
                    print(`finished rows: ${string.format("%.2f", (finishedRows / imageDimensions.Y) * 100)}%`)
                    lastRowPrinted = currentCompletion
                }
                resolve()
            })
            actor.SendMessage(COMPUTE_ROW_MESSAGE, actorMessage)
        })
        allRowsCompleted.push(rowCompleted)
    }
    await Promise.all(allRowsCompleted)

    const output =  combineAllBuffers(calculatedRows, settings)
    return output
}

export function getRenderMaterialMap(): Map<Enum.Material, number> {
    const materials = Enum.Material.GetEnumItems()
    const materialMap = new Map<Enum.Material, number>()
    let counter = 1 
    materials.forEach(material => {
        materialMap.set(material, counter)
        counter++
    })
    return materialMap
}

function combineAllBuffers(buffs: ImageBuffers[], settings: Settings): ImageBuffers {
    const output = generateBufferChannels(settings)
    const imageDimensions = getImageDimensions(settings)
    for (let i = 0; i < buffs.size(); i++) {
        buffer.writestring(output.red, i * imageDimensions.X, buffer.tostring(buffs[i].red))
        buffer.writestring(output.green, i * imageDimensions.X, buffer.tostring(buffs[i].green))
        buffer.writestring(output.blue, i * imageDimensions.X, buffer.tostring(buffs[i].blue))
        buffer.writestring(output.height, i * imageDimensions.X, buffer.tostring(buffs[i].height))
        buffer.writestring(output.material, i * imageDimensions.X, buffer.tostring(buffs[i].material))
        buffer.writestring(output.roads, i * imageDimensions.X, buffer.tostring(buffs[i].roads))
        buffer.writestring(output.buildings, i * imageDimensions.X, buffer.tostring(buffs[i].buildings))
        buffer.writestring(output.water, i * imageDimensions.X, buffer.tostring(buffs[i].water))
    }
    return output
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

