import { Settings } from 'shared/settings/settings.model'
import { RenderConstants } from './render.model'
import { getImageDimensions } from 'shared/utils'
import { ImageBuffers } from 'shared/file/file.modal'
import { ActorMessage, COMPUTE_ROW_MESSAGE } from 'actor/actor.model'
import { WorkerPool } from './actor-pool.handler'
import { generateBufferChannels } from 'shared/file/file.utils'


export async function render(settings: Settings): Promise<ImageBuffers> {
    const imageDimensions = getImageDimensions(settings)
    const renderConstants = getRenderConstants(settings, imageDimensions)

    const pool = new WorkerPool(settings)

    const calculatedRows: ImageBuffers[] = []
    const allRowsCompleted: Promise<void>[] = []

    for (let row = 0; row < imageDimensions.Y; row++) {
        const actorMessage: ActorMessage = {
            settings,
            row,
            renderConstants
        }
        const rowCompleted = new Promise<void>(async (resolve) => {
            const actor = await pool.getActor(settings)
            const rowCalculatedEvent = actor.FindFirstChild("rowCalculated") as BindableEvent
            const binding = rowCalculatedEvent.Event.Connect((data: ImageBuffers) => {
                calculatedRows[row] = data
                binding.Disconnect()
                pool.cleanupActor(actor)
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

function getRenderMaterialMap(): Map<number, number> {
    const materials = Enum.Material.GetEnumItems()
    const materialMap = new Map<number, number>()
    materials.forEach((material, index: number) => {
        materialMap.set(material.Value, index)
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

