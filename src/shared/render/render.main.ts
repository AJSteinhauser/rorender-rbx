import { Settings } from 'shared/settings/settings.model'
import { Pixel, RenderConstants } from './render.model'
import { getImageDimensions } from 'shared/utils'
import { ImageBuffers } from 'shared/file/file.modal'
import { WorkerPool } from './actor-pool.handler'
import { generateBufferChannels } from 'shared/file/file.utils'
import { computePixel, delayForScriptExhuastion } from './render.utils'
import { ActorMessage, COMPUTE_ROW_MESSAGE } from './actor.model'
import { ProgressUpdateHooks } from 'ui/screens/main'

const meshPixels = script.Parent?.Parent?.Parent?.FindFirstChild("threads")?.FindFirstChild("meshPixel") as BindableEvent

export async function render(settings: Settings, progressHooks: ProgressUpdateHooks): Promise<ImageBuffers> {
    const imageDimensions = getImageDimensions(settings)
    const renderConstants = getRenderConstants(settings, imageDimensions)

    const pool = new WorkerPool(settings)

    const calculatedRows: ImageBuffers[] = []
    const allRowsCompleted: Promise<void>[] = []

    let startTime = tick()
    let finishedRows = 0
    let lastRowPrinted = 0

    const meshCalculation: Vector2[] = []
    const meshPixelsConnection = meshPixels.Event.Connect((position: Vector2) => {
        meshCalculation.push(position)
    })
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
                if (currentCompletion - lastRowPrinted > 0.05) {
                    //print(`finished rows: ${string.format("%.2f", (finishedRows / imageDimensions.Y) * 100)}%`)
                    progressHooks.setCurrentProgress(finishedRows / imageDimensions.Y)
                    task.wait(.05)
                    lastRowPrinted = currentCompletion
                }
                resolve()
            })
            actor.SendMessage(COMPUTE_ROW_MESSAGE, actorMessage)
        })
        allRowsCompleted.push(rowCompleted)
        //for (let col = 0; col < imageDimensions.X; col++) {
        //    computePixel(new Vector2(col, row),settings, renderConstants)
        //}
    }
    await Promise.all(allRowsCompleted)

    pool.cleanup()
    meshPixelsConnection.Disconnect()
    const output = combineAllBuffers(calculatedRows, settings)

    const texturePixels = new Map<Vector2, Pixel>()

    progressHooks.setCurrentStatusText("Computing Mesh Textures...") 
    progressHooks.setCurrentProgress(0)
    for (let i = 0; i < meshCalculation.size(); i++) {
        const position = meshCalculation[i]
        startTime = delayForScriptExhuastion(startTime)
        const pixel = await computePixel(position, settings, renderConstants, meshPixels, false)
        if (pixel) {
            texturePixels.set(position, pixel)
        }
        progressHooks.setCurrentProgress(i / meshCalculation.size())
    }

    progressHooks.setCurrentProgress(0)
    progressHooks.setCurrentStatusText("Splicing Mesh Textures...") 
    spliceTexturedPixelsIn(output, texturePixels, imageDimensions)
    return output
}

export function spliceTexturedPixelsIn(buffers: ImageBuffers, texturedPixels: Map<Vector2, Pixel>, imageSize: Vector2) {
    texturedPixels.forEach((pixel, key) => {
        const bufferPosition = key.X + imageSize.X * key.Y
        buffer.writeu8(buffers.red, bufferPosition, pixel.r)
        buffer.writeu8(buffers.green, bufferPosition, pixel.g)
        buffer.writeu8(buffers.blue, bufferPosition, pixel.b)
        buffer.writeu8(buffers.height, bufferPosition, pixel.h)
        buffer.writeu8(buffers.material, bufferPosition, pixel.material)
        buffer.writeu8(buffers.roads, bufferPosition, pixel.road)
        buffer.writeu8(buffers.buildings, bufferPosition, pixel.building)
        buffer.writeu8(buffers.water, bufferPosition, pixel.water)
    })
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
    const rayLength = settings.mapScale.Y

    const materialMap = getRenderMaterialMap()

    const mapScale = settings.mapScale
    const mapCFrame = settings.mapCFrame

    const offset = mapScale.mul(new Vector3(-.5, .5, -.5))

    return {
        startingPosition: mapCFrame.mul(new CFrame(offset)),
        rayLength,
        imageDimensions,
        rayVector: settings.mapCFrame.UpVector.mul(-1).mul(rayLength),
        materialMap,
    }
}

