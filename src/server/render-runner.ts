import {
    buildEncodingMap,
    buildTreeFromFrequencyTable,
    generatePriorityQueue,
    huffmanEncode,
    writeTreeToBuffer
} from "shared/compression/huffman/huffman-encoding.compression"
import { runLengthEncode } from "shared/compression/run-length/run-length-encoding.compression"
import {
    generateStringEncodings,
    mergeImageBuffersIntoSingleBuffer,
    writeHeader
} from "shared/file/file.utils"
import { ImageBuffers } from "shared/file/file.modal"
import { render, renderPreview } from "shared/render/render.main"
import { ParsedRenderId } from "shared/render/render.model"
import {
    getImageSizeError,
    getImageDimensions,
    HTTPS_BODY_LIMIT,
    splitImageIntoChunks
} from "shared/utils"
import { Settings } from "shared/settings/settings.model"
import { ProgressUpdateHooks } from "ui/screens/main"
import LocalizationModule from "shared/localization/localization"

const httpService = game.GetService("HttpService")

const UPLOAD_URL = "https://uploadrenderchunk-izsda2emzq-uc.a.run.app"
const VALIDATE_URL =
    "https://validateimagepipeline-izsda2emzq-uc.a.run.app/validateImagePipeline"
const ROSA_MAX_DIMENSION = 2000
const WATER_OPACITY = 0.7

// Returns an error string on failure, undefined on success
function validateRosaPipeline(rawId: string): string | undefined {
    const { translate } = LocalizationModule
    const [requestOk, response] = pcall(() =>
        httpService.RequestAsync({
            Url: VALIDATE_URL,
            Method: "GET",
            Headers: { pipelineId: rawId }
        })
    )
    if (!requestOk) return translate("PipelineValidationFailed")
    if (response.StatusCode !== 200)
        return `${translate("PipelineValidationFailed")}: ${response.Body}`
    const [decodeOk, body] = pcall(
        () => httpService.JSONDecode(response.Body) as { valid: boolean }
    )
    if (!decodeOk || !body.valid) return translate("PipelineValidationFailed")
    return undefined
}

function buildRosaSettings(settings: Settings): Settings {
    const clampedResolution = math.max(
        settings.resolution,
        math.max(
            settings.mapScale.X / ROSA_MAX_DIMENSION,
            settings.mapScale.Z / ROSA_MAX_DIMENSION
        )
    )
    const existingMaterials = settings.water.materials ?? []
    return {
        ...settings,
        resolution: clampedResolution,
        water: {
            ...settings.water,
            materials: existingMaterials.includes(Enum.Material.Water)
                ? existingMaterials
                : [Enum.Material.Water, ...existingMaterials]
        }
    }
}

function applyWaterOverlay(output: ImageBuffers, pixelCount: number): void {
    const waterColor = game.Workspace.Terrain.WaterColor
    for (let i = 0; i < pixelCount; i++) {
        if (buffer.readu8(output.water, i) > 0) {
            buffer.writeu8(
                output.red,
                i,
                math.floor(
                    (1 - WATER_OPACITY) * buffer.readu8(output.red, i) +
                        WATER_OPACITY * waterColor.R * 255
                )
            )
            buffer.writeu8(
                output.green,
                i,
                math.floor(
                    (1 - WATER_OPACITY) * buffer.readu8(output.green, i) +
                        WATER_OPACITY * waterColor.G * 255
                )
            )
            buffer.writeu8(
                output.blue,
                i,
                math.floor(
                    (1 - WATER_OPACITY) * buffer.readu8(output.blue, i) +
                        WATER_OPACITY * waterColor.B * 255
                )
            )
        }
    }
}

function packageRawImageAndUpload(
    effectiveSettings: Settings,
    output: ImageBuffers,
    parsedId: ParsedRenderId,
    progressHooks: ProgressUpdateHooks
): void {
    const { translate } = LocalizationModule

    progressHooks.setCurrentProgress(0)
    progressHooks.setCurrentStatusText(translate("CompressingDataRun"))
    const merged = mergeImageBuffersIntoSingleBuffer(output)

    const start = tick()
    const encoded = runLengthEncode(merged)
    print(translate("Time"), tick() - start)

    finalizeAndUpload(
        effectiveSettings,
        encoded,
        buffer.len(merged),
        parsedId,
        progressHooks
    )
}

function finalizeAndUpload(
    effectiveSettings: Settings,
    encoded: buffer,
    approxRawSizeBytes: number,
    parsedId: ParsedRenderId,
    progressHooks: ProgressUpdateHooks
): void {
    const { translate } = LocalizationModule

    progressHooks.setCurrentProgress(1 / 4)
    progressHooks.setCurrentStatusText(translate("PerformingDataAccumulation"))
    const headerBuffer = writeHeader(effectiveSettings)

    print(getImageDimensions(effectiveSettings))
    print(string.format(translate("Raw"), approxRawSizeBytes / 1000))
    print(
        string.format(
            translate("RawPacketsRequired"),
            math.ceil(approxRawSizeBytes / HTTPS_BODY_LIMIT)
        )
    )

    progressHooks.setCurrentProgress(2 / 4)
    progressHooks.setCurrentStatusText(translate("CompressingDataHuffman"))
    const huffmanTree = buildTreeFromFrequencyTable(
        generatePriorityQueue(encoded)
    )
    const huffmanEncoded = huffmanEncode(encoded, buildEncodingMap(huffmanTree))
    const treeBuffer = writeTreeToBuffer(huffmanTree)
    print(
        string.format(
            translate("RLECompression"),
            (1 - buffer.len(encoded) / approxRawSizeBytes) * 100
        )
    )
    print(
        string.format(
            translate("HuffmanPlusRLECompression"),
            (1 - buffer.len(huffmanEncoded.data) / approxRawSizeBytes) * 100
        )
    )
    print(
        string.format(
            translate("HuffmanPacketsRequired"),
            math.ceil(buffer.len(huffmanEncoded.data) / HTTPS_BODY_LIMIT)
        )
    )

    progressHooks.setCurrentProgress(3 / 4)
    progressHooks.setCurrentStatusText(translate("AddingFinalEncodings"))
    const accumulatedBuffer = buffer.create(
        buffer.len(headerBuffer) +
            buffer.len(treeBuffer) +
            4 +
            buffer.len(huffmanEncoded.data)
    )
    buffer.copy(accumulatedBuffer, 0, headerBuffer, 0, buffer.len(headerBuffer))
    buffer.copy(
        accumulatedBuffer,
        buffer.len(headerBuffer),
        treeBuffer,
        0,
        buffer.len(treeBuffer)
    )
    buffer.writeu32(
        accumulatedBuffer,
        buffer.len(headerBuffer) + buffer.len(treeBuffer),
        huffmanEncoded.bitLength
    )
    buffer.copy(
        accumulatedBuffer,
        buffer.len(headerBuffer) + buffer.len(treeBuffer) + 4,
        huffmanEncoded.data,
        0,
        buffer.len(huffmanEncoded.data)
    )
    print(translate("BitLength") + huffmanEncoded.bitLength)
    print(
        string.format(
            translate("FinalSize"),
            buffer.len(accumulatedBuffer) / 1000
        )
    )
    print(
        string.format(
            translate("FinalPacketsRequired"),
            math.ceil(buffer.len(accumulatedBuffer) / HTTPS_BODY_LIMIT)
        )
    )

    const split = splitImageIntoChunks(buffer.tostring(accumulatedBuffer))
    progressHooks.setCurrentProgress(0)
    progressHooks.setCurrentStatusText(translate("SendingDataToServer"))

    let chunksSent = 0
    Promise.all(
        split.map(
            (chunk, idx) =>
                new Promise<void>((success, failure) => {
                    print(
                        translate("Sent") + tostring(idx),
                        translate("Size") + chunk.size()
                    )
                    const [httpOk, errorMsg] = pcall(() =>
                        httpService.PostAsync(
                            UPLOAD_URL,
                            chunk,
                            Enum.HttpContentType.TextPlain,
                            false,
                            {
                                chunkId: tostring(idx),
                                totalChunks: tostring(split.size()),
                                pipelineId: parsedId.rawId
                            }
                        )
                    )
                    if (httpOk) {
                        progressHooks.setCurrentProgress(
                            ++chunksSent / split.size()
                        )
                        success()
                    } else {
                        failure(errorMsg)
                    }
                })
        )
    )
        .then(() => {
            progressHooks.setCurrentStatusText(translate("RenderComplete"))
            progressHooks.renderComplete()
        })
        .catch((e) => progressHooks.errorOccured(tostring(e)))
}

export const runRender = (
    renderSettings: Settings,
    parsedId: ParsedRenderId,
    progressHooks: ProgressUpdateHooks
) => {
    const { translate } = LocalizationModule

    if (parsedId.destination === "rosa") {
        progressHooks.setCurrentStatusText(translate("ValidatingPipeline"))
        progressHooks.setCurrentProgress(0)
        const validationError = validateRosaPipeline(parsedId.rawId)
        if (validationError) {
            progressHooks.errorOccured(validationError)
            return
        }

        const rosaSettings = buildRosaSettings(renderSettings)
        progressHooks.setCurrentStatusText(translate("RenderingImage"))
        progressHooks.setCurrentProgress(0)
        task.wait(0.5)

        renderPreview(rosaSettings)
            .then((output) => {
                const dims = getImageDimensions(rosaSettings)
                applyWaterOverlay(output, dims.X * dims.Y)
                packageRawImageAndUpload(
                    rosaSettings,
                    output,
                    parsedId,
                    progressHooks
                )
            })
            .catch((e) => progressHooks.errorOccured(tostring(e)))
        return
    }

    const sizeError = getImageSizeError(renderSettings)
    if (sizeError) {
        progressHooks.errorOccured(sizeError)
        return
    }

    progressHooks.setCurrentStatusText(translate("RenderingImage"))
    progressHooks.setCurrentProgress(0)
    task.wait(0.5)
    render(renderSettings, progressHooks)
        .then((encoded) => {
            const dims = getImageDimensions(renderSettings)
            const approxRawSizeBytes =
                dims.X * dims.Y * 8 +
                buffer.len(generateStringEncodings(renderSettings))
            finalizeAndUpload(
                renderSettings,
                encoded,
                approxRawSizeBytes,
                parsedId,
                progressHooks
            )
        })
        .catch((e) => progressHooks.errorOccured(tostring(e)))
}
