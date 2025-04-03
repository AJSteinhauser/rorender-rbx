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

const httpService = game.GetService("HttpService")

//runTests()

export const runRender = (
    renderSettings: Settings,
    renderId: string,
    progressHooks: ProgressUpdateHooks
) => {
    try {
        ensureImageLessThanMaxSize(renderSettings)
    } catch (e: any) {
        progressHooks.errorOccured(e)
        return
    }
    progressHooks.setCurrentStatusText("Rendering Image...")
    progressHooks.setCurrentProgress(0)
    task.wait(0.5)
    render(renderSettings, progressHooks)
        .then((output) => {
            const headerBuffer = writeHeader(getImageDimensions(renderSettings))

            progressHooks.setCurrentProgress(0)
            progressHooks.setCurrentStatusText(
                "Performing Data Accumulation..."
            )
            const merged = mergeImageBuffersIntoSingleBuffer(output)

            progressHooks.setCurrentProgress(1 / 4)
            progressHooks.setCurrentStatusText(
                "Compressing Data [Run Length Encoding]"
            )
            const start = tick()
            const encoded = runLengthEncode(merged)
            print("Time: ", tick() - start)

            print(getImageDimensions(renderSettings))
            print("\n\n")
            print(string.format("RAW: %.2f KB", buffer.len(merged) / 1000))
            print(
                string.format(
                    "RAW Packets Required: %d",
                    math.ceil(buffer.len(merged) / HTTPS_BODY_LIMIT)
                )
            )
            print("\n\n")

            print(
                string.format(
                    "RLE compression: %.2f%%",
                    (1 - buffer.len(encoded) / buffer.len(merged)) * 100
                )
            )
            print(string.format("RLE: %2.f KB", buffer.len(encoded) / 1000))
            print(
                string.format(
                    "RLE Packets Required: %d",
                    math.ceil(buffer.len(encoded) / HTTPS_BODY_LIMIT)
                )
            )
            print("\n\n")

            progressHooks.setCurrentProgress(2 / 4)
            progressHooks.setCurrentStatusText(
                "Compressing Data [Huffman Encoding]"
            )
            const frequencyTable = generatePriorityQueue(encoded)
            const huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
            const huffmanMap = buildEncodingMap(huffmanTree)

            const huffmanEncoded = huffmanEncode(encoded, huffmanMap)
            print(
                string.format(
                    "Huffman + RLE compression: %.2f%%",
                    (1 - buffer.len(huffmanEncoded.data) / buffer.len(merged)) *
                        100
                )
            )
            print(
                string.format(
                    "Huffman: %2.f KB",
                    buffer.len(huffmanEncoded.data) / 1000
                )
            )
            print(
                string.format(
                    "Huffman Packets Required: %d",
                    math.ceil(
                        buffer.len(huffmanEncoded.data) / HTTPS_BODY_LIMIT
                    )
                )
            )
            print("\n\n")

            const treeBuffer = writeTreeToBuffer(huffmanTree)

            // header -> tree -> data length -> data
            progressHooks.setCurrentProgress(3 / 4)
            progressHooks.setCurrentStatusText("Adding Final Encodings...")
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

            print("bit length: " + huffmanEncoded.bitLength)

            print(
                string.format(
                    "Final Size : %2.f KB",
                    buffer.len(accumulatedBuffer) / 1000
                )
            )
            print(
                string.format(
                    "Final Packets Required: %d",
                    math.ceil(buffer.len(accumulatedBuffer) / HTTPS_BODY_LIMIT)
                )
            )

            const outputData = buffer.tostring(accumulatedBuffer)
            const split = splitImageIntoChunks(outputData)
            progressHooks.setCurrentProgress(0)
            progressHooks.setCurrentStatusText("Sending Data to RoRender.com")

            let chunksSent = 0
            const promises: Promise<void>[] = []
            split.forEach((chunk, idx) => {
                promises.push(
                    new Promise<void>((success, failure) => {
                        print("sent " + tostring(idx), "size: " + chunk.size())
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
                    progressHooks.setCurrentStatusText("Render Complete...")
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
