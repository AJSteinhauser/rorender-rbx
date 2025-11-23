import {
    buildEncodingMap,
    buildTreeFromFrequencyTable,
    generatePriorityQueue,
    huffmanEncode,
    writeTreeToBuffer
} from "shared/compression/huffman/huffman-encoding.compression"
import { runLengthEncode } from "shared/compression/run-length/run-length-encoding.compression"
import {
    mergeImageBuffersIntoSingleBuffer,
    writeHeader
} from "shared/file/file.utils"
import { render } from "shared/render/render.main"
import {
    ensureImageLessThanMaxSize,
    getImageDimensions,
    HTTPS_BODY_LIMIT,
    splitImageIntoChunks
} from "shared/utils"
import { runTests } from "shared/tests/test-runner"
import { Settings } from "shared/settings/settings.model"
import { ProgressUpdateHooks } from "ui/screens/main"
import { object } from "@rbxts/react/src/prop-types"
import LocalizationModule from "shared/localization/localization"

const httpService = game.GetService("HttpService")

//runTests()

export const runRender = (
    renderSettings: Settings,
    renderId: string,
    progressHooks: ProgressUpdateHooks
) => {
    const { translate } = LocalizationModule
    try {
        ensureImageLessThanMaxSize(renderSettings)
    } catch (e: any) {
        progressHooks.errorOccured(e)
        return
    }
    print(translate("RenderingImage"))
    progressHooks.setCurrentStatusText(translate("RenderingImage"))
    progressHooks.setCurrentProgress(0)
    task.wait(0.5)
    render(renderSettings, progressHooks)
        .then((output) => {
            const headerBuffer = writeHeader(renderSettings)

            progressHooks.setCurrentProgress(0)
            progressHooks.setCurrentStatusText(
                translate("PerformingDataAccumulation")
            )
            const merged = mergeImageBuffersIntoSingleBuffer(output)

            progressHooks.setCurrentProgress(1 / 4)
            progressHooks.setCurrentStatusText(translate("CompressingDataRun"))
            const start = tick()
            const encoded = runLengthEncode(merged)
            print(translate("Time"), tick() - start)

            print(getImageDimensions(renderSettings))
            print("\n\n")
            print(string.format(translate("Raw"), buffer.len(merged) / 1000))
            print(
                string.format(
                    translate("RawPacketsRequired"),
                    math.ceil(buffer.len(merged) / HTTPS_BODY_LIMIT)
                )
            )
            print("\n\n")

            print(
                string.format(
                    translate("RLECompression"),
                    (1 - buffer.len(encoded) / buffer.len(merged)) * 100
                )
            )
            print(string.format(translate("RLE"), buffer.len(encoded) / 1000))
            print(
                string.format(
                    translate("RLEPacketsRequired"),
                    math.ceil(buffer.len(encoded) / HTTPS_BODY_LIMIT)
                )
            )
            print("\n\n")

            progressHooks.setCurrentProgress(2 / 4)
            progressHooks.setCurrentStatusText(
                translate("CompressingDataHuffman")
            )
            const frequencyTable = generatePriorityQueue(encoded)
            const huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
            const huffmanMap = buildEncodingMap(huffmanTree)

            const huffmanEncoded = huffmanEncode(encoded, huffmanMap)
            print(
                string.format(
                    translate("HuffmanPlusRLECompression"),
                    (1 - buffer.len(huffmanEncoded.data) / buffer.len(merged)) *
                        100
                )
            )
            print(
                string.format(
                    translate("Huffman"),
                    buffer.len(huffmanEncoded.data) / 1000
                )
            )
            print(
                string.format(
                    translate("HuffmanPacketsRequired"),
                    math.ceil(
                        buffer.len(huffmanEncoded.data) / HTTPS_BODY_LIMIT
                    )
                )
            )
            print("\n\n")

            const treeBuffer = writeTreeToBuffer(huffmanTree)

            // header -> tree -> data length -> data
            progressHooks.setCurrentProgress(3 / 4)
            progressHooks.setCurrentStatusText(
                translate("AddingFinalEncodings")
            )
            const accumulatedBuffer = buffer.create(
                buffer.len(headerBuffer) +
                    buffer.len(treeBuffer) +
                    4 +
                    buffer.len(huffmanEncoded.data)
            )

            buffer.copy(
                accumulatedBuffer,
                0,
                headerBuffer,
                0,
                buffer.len(headerBuffer)
            )
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

            const outputData = buffer.tostring(accumulatedBuffer)
            const split = splitImageIntoChunks(outputData)
            progressHooks.setCurrentProgress(0)
            progressHooks.setCurrentStatusText(translate("SendingDataToServer"))

            let chunksSent = 0
            const promises: Promise<void>[] = []
            split.forEach((chunk, idx) => {
                promises.push(
                    new Promise<void>((success, failure) => {
                        print(
                            translate("Sent") + tostring(idx),
                            translate("Size") + chunk.size()
                        )
                        const [httpSuccess, errorMsg] = pcall(() => {
                            const response = httpService.PostAsync(
                                "https://uploadrenderchunk-izsda2emzq-uc.a.run.app",
                                chunk,
                                Enum.HttpContentType.TextPlain,
                                false,
                                {
                                    chunkId: tostring(idx),
                                    totalChunks: tostring(split.size()),
                                    pipelineId: renderId
                                }
                            )
                        })
                        if (httpSuccess) {
                            chunksSent++
                            progressHooks.setCurrentProgress(
                                chunksSent / split.size()
                            )
                            success()
                        } else {
                            failure(errorMsg)
                        }
                    })
                )
            })
            Promise.all(promises)
                .then((_) => {
                    progressHooks.setCurrentStatusText(
                        translate("RenderComplete")
                    )
                    progressHooks.renderComplete()
                })
                .catch((e) => {
                    progressHooks.errorOccured(tostring(e))
                })
        })
        .catch((e) => {
            progressHooks.errorOccured(tostring(e))
        })
}
