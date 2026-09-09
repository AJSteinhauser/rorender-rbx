import { Settings } from "shared/settings/settings.model"
import { RenderConstants } from "./render.model"
import { getImageDimensions } from "shared/utils"
import {
    ImageBuffers,
    RASTER_CHANNEL_ORDER,
    RleRow,
    RleRowBuffers
} from "shared/file/file.modal"
import { WorkerPool } from "./actor-pool.handler"
import {
    assembleFinalRleBuffer,
    generateBufferChannels,
    generateEmptyRleRowBuffers,
    generateStringEncodings,
    writePixelToImageBuffer
} from "shared/file/file.utils"
import { computePixel, delayForScriptExhuastion } from "./render.utils"
import { ActorMessage, COMPUTE_ROW_MESSAGE } from "./actor.model"
import { ProgressUpdateHooks } from "ui/screens/main"
import {
    runLengthDecode,
    runLengthEncode
} from "shared/compression/run-length/run-length-encoding.compression"

const meshPixels = script.Parent?.Parent?.Parent?.FindFirstChild(
    "threads"
)?.FindFirstChild("meshPixel") as BindableEvent

export async function render(
    settings: Settings,
    progressHooks: ProgressUpdateHooks
): Promise<buffer> {
    const imageDimensions = getImageDimensions(settings)
    const renderConstants = getRenderConstants(settings, imageDimensions)

    const pool = new WorkerPool(settings)

    const rleRows: RleRowBuffers = generateEmptyRleRowBuffers()
    const allRowsCompleted: Promise<void>[] = []

    let startTime = tick()
    let finishedRows = 0
    let lastRowPrinted = 0

    const meshCalculationByRow = new Map<number, Vector2[]>()
    let counter = 0
    const meshPixelsConnection = meshPixels.Event.Connect(
        (positions: Vector2[]) => {
            counter++
            positions.forEach((pos) => {
                const bucket = meshCalculationByRow.get(pos.Y) ?? []
                bucket.push(pos)
                meshCalculationByRow.set(pos.Y, bucket)
            })
        }
    )
    task.wait(0.1) // Allow time for actors to initalize and message recievers to bind to actor parent
    for (let row = 0; row < imageDimensions.Y; row++) {
        startTime = delayForScriptExhuastion(startTime)
        const actorMessage: ActorMessage = {
            settings,
            row,
            renderConstants,
            encodeOnRow: true
        }
        const rowCompleted = new Promise<void>(async (resolve) => {
            const renderRowTask = (actor: Actor): Promise<void> => {
                const rowCalculatedEvent = actor.FindFirstChild(
                    "rowCalculated"
                ) as BindableEvent
                const binding = rowCalculatedEvent.Event.Connect(
                    (data: RleRow) => {
                        binding.Disconnect()
                        startTime = delayForScriptExhuastion(startTime)
                        for (let channel of RASTER_CHANNEL_ORDER) {
                            rleRows[channel][row] = data[channel]
                        }
                        finishedRows++
                        const currentCompletion =
                            finishedRows / imageDimensions.Y
                        if (currentCompletion - lastRowPrinted > 0.05) {
                            //print(`finished rows: ${string.format("%.2f", (finishedRows / imageDimensions.Y) * 100)}%`)
                            progressHooks.setCurrentProgress(
                                finishedRows / imageDimensions.Y
                            )
                            task.wait(0.05)
                            lastRowPrinted = currentCompletion
                        }
                        resolve()
                    }
                )
                actor.SendMessage(COMPUTE_ROW_MESSAGE, actorMessage)
                return rowCompleted
            }
            pool.queueTask(renderRowTask)
        })

        allRowsCompleted.push(rowCompleted)
    }
    await Promise.all(allRowsCompleted)
    print(counter, "total pixels to be texture counted")

    pool.cleanup()
    meshPixelsConnection.Disconnect()

    progressHooks.setCurrentStatusText("Computing Mesh Textures...")
    progressHooks.setCurrentProgress(0)
    let totalMeshPixels = 0
    meshCalculationByRow.forEach((positions) => {
        totalMeshPixels += positions.size()
    })
    print("Total mesh calculations", totalMeshPixels)

    const progressState = { patched: 0, total: totalMeshPixels }
    let rowYieldTime = tick()
    meshCalculationByRow.forEach((positions, row) => {
        rowYieldTime = delayForScriptExhuastion(rowYieldTime)
        patchRowInPlace(
            rleRows,
            row,
            positions,
            settings,
            renderConstants,
            progressState,
            progressHooks
        )
    })

    progressHooks.setCurrentProgress(0)
    progressHooks.setCurrentStatusText("Splicing Mesh Textures...")
    return assembleFinalRleBuffer(rleRows, generateStringEncodings(settings))
}

function patchRowInPlace(
    rleRows: RleRowBuffers,
    row: number,
    patchPositions: Vector2[],
    settings: Settings,
    renderConstants: RenderConstants,
    progressState: { patched: number; total: number },
    progressHooks: ProgressUpdateHooks
): void {
    const rowBuffers: ImageBuffers = {
        red: runLengthDecode(rleRows.red[row]),
        green: runLengthDecode(rleRows.green[row]),
        blue: runLengthDecode(rleRows.blue[row]),
        height: runLengthDecode(rleRows.height[row]),
        material: runLengthDecode(rleRows.material[row]),
        roads: runLengthDecode(rleRows.roads[row]),
        buildings: runLengthDecode(rleRows.buildings[row]),
        water: runLengthDecode(rleRows.water[row]),
        materialsEncoding: buffer.create(0)
    }

    let startTime = tick()
    for (let position of patchPositions) {
        startTime = delayForScriptExhuastion(startTime)
        const pixel = computePixel(position, settings, renderConstants, false)
        if (pixel && pixel !== "texture") {
            writePixelToImageBuffer(position.X, pixel, rowBuffers)
        }
        progressState.patched++
        if (progressState.patched % 30 === 0) {
            progressHooks.setCurrentProgress(
                progressState.patched / progressState.total
            )
        }
    }

    for (let channel of RASTER_CHANNEL_ORDER) {
        rleRows[channel][row] = runLengthEncode(rowBuffers[channel])
    }
}

export async function renderPreview(settings: Settings): Promise<ImageBuffers> {
    const imageDimensions = getImageDimensions(settings)
    const renderConstants = getRenderConstants(settings, imageDimensions)

    const pool = new WorkerPool(settings)

    const calculatedRows: ImageBuffers[] = []
    const allRowsCompleted: Promise<void>[] = []

    let startTime = tick()
    let finishedRows = 0

    const meshCalculation: Vector2[] = []
    let counter = 0
    const meshPixelsConnection = meshPixels.Event.Connect(
        (positions: Vector2[]) => {
            counter++
            positions.forEach((pos) => meshCalculation.push(pos))
        }
    )
    task.wait(0.1) // Allow time for actors to initalize and message recievers to bind to actor parent
    for (let row = 0; row < imageDimensions.Y; row++) {
        startTime = delayForScriptExhuastion(startTime)
        const actorMessage: ActorMessage = {
            settings,
            row,
            renderConstants,
            encodeOnRow: false
        }
        const rowCompleted = new Promise<void>(async (resolve) => {
            const renderRowTask = (actor: Actor): Promise<void> => {
                const rowCalculatedEvent = actor.FindFirstChild(
                    "rowCalculated"
                ) as BindableEvent
                const binding = rowCalculatedEvent.Event.Connect(
                    (data: ImageBuffers) => {
                        startTime = delayForScriptExhuastion(startTime)
                        calculatedRows[row] = data
                        binding.Disconnect()
                        finishedRows++
                        resolve()
                    }
                )
                actor.SendMessage(COMPUTE_ROW_MESSAGE, actorMessage)
                return rowCompleted
            }
            pool.queueTask(renderRowTask)
        })
        allRowsCompleted.push(rowCompleted)
    }
    await Promise.all(allRowsCompleted)
    pool.cleanup()
    meshPixelsConnection.Disconnect()
    const output = combineAllBuffers(calculatedRows, settings)

    return output
}

export function getRenderMaterialMap(): Map<Enum.Material, number> {
    const materials = Enum.Material.GetEnumItems()
    const materialMap = new Map<Enum.Material, number>()
    let counter = 1
    materials.forEach((material) => {
        materialMap.set(material, counter)
        counter++
    })
    return materialMap
}

function combineAllBuffers(
    buffs: ImageBuffers[],
    settings: Settings
): ImageBuffers {
    const output = generateBufferChannels(settings)
    const imageDimensions = getImageDimensions(settings)
    for (let i = 0; i < buffs.size(); i++) {
        buffer.writestring(
            output.red,
            i * imageDimensions.X,
            buffer.tostring(buffs[i].red)
        )
        buffer.writestring(
            output.green,
            i * imageDimensions.X,
            buffer.tostring(buffs[i].green)
        )
        buffer.writestring(
            output.blue,
            i * imageDimensions.X,
            buffer.tostring(buffs[i].blue)
        )
        buffer.writestring(
            output.height,
            i * imageDimensions.X,
            buffer.tostring(buffs[i].height)
        )
        buffer.writestring(
            output.material,
            i * imageDimensions.X,
            buffer.tostring(buffs[i].material)
        )
        buffer.writestring(
            output.roads,
            i * imageDimensions.X,
            buffer.tostring(buffs[i].roads)
        )
        buffer.writestring(
            output.buildings,
            i * imageDimensions.X,
            buffer.tostring(buffs[i].buildings)
        )
        buffer.writestring(
            output.water,
            i * imageDimensions.X,
            buffer.tostring(buffs[i].water)
        )
    }
    return output
}

function getRenderConstants(
    settings: Settings,
    imageDimensions: Vector2
): RenderConstants {
    const rayLength = settings.mapScale.Y

    const materialMap = getRenderMaterialMap()

    const mapScale = settings.mapScale
    const mapCFrame = settings.mapCFrame

    const offset = mapScale.mul(new Vector3(-0.5, 0.5, -0.5))

    return {
        startingPosition: mapCFrame.mul(new CFrame(offset)),
        rayLength,
        imageDimensions,
        rayVector: settings.mapCFrame.UpVector.mul(-1).mul(rayLength),
        materialMap,
        sharedCaches: {
            roadCache: new Map<Instance, number>(),
            buildingCache: new Map<Instance, number>()
        }
    }
}
