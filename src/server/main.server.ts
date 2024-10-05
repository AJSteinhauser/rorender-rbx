import { buildEncodingMap, buildTreeFromFrequencyTable, generatePriorityQueue, huffmanEncode, writeTreeToBuffer } from 'shared/compression/huffman/huffman-encoding.compression'
import {  runLengthEncode } from 'shared/compression/run-length/run-length-encoding.compression'
import { mergeImageBuffersIntoSingleBuffer, writeHeader } from 'shared/file/file.utils'
import { render } from 'shared/render/render.main'
import { renderSettings } from 'shared/settings/settings'
import { getImageDimensions, HTTPS_BODY_LIMIT, splitImageIntoChunks } from 'shared/utils'
import { runTests } from 'shared/tests/test-runner'

const httpService = game.GetService('HttpService')

runTests()

task.wait(2)
const output = render(renderSettings)
const headerBuffer = writeHeader(getImageDimensions(renderSettings))

const merged = mergeImageBuffersIntoSingleBuffer(output)

const encoded = runLengthEncode(merged)

print(getImageDimensions(renderSettings))
print('\n\n')
print(string.format("RAW: %.2f KB", buffer.len(merged) / 1000))
print(string.format("RAW Packets Required: %d", math.ceil(buffer.len(merged) / HTTPS_BODY_LIMIT)))
print("\n\n")

print(string.format("RLE compression: %.2f%%", (1 - (buffer.len(encoded) / buffer.len(merged))) * 100))
print(string.format("RLE: %2.f KB", buffer.len(encoded) / 1000))
print(string.format("RLE Packets Required: %d", math.ceil(buffer.len(encoded) / HTTPS_BODY_LIMIT)))
print("\n\n")

const frequencyTable = generatePriorityQueue(encoded)
const huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
const huffmanMap = buildEncodingMap(huffmanTree)


const huffmanEncoded = huffmanEncode(encoded, huffmanMap)
print(string.format("Huffman + RLE compression: %.2f%%", (1 - (buffer.len(huffmanEncoded.data) / buffer.len(merged))) * 100))
print(string.format("Huffman: %2.f KB", buffer.len(huffmanEncoded.data) / 1000))
print(string.format("Huffman Packets Required: %d", math.ceil(buffer.len(huffmanEncoded.data) / HTTPS_BODY_LIMIT)))
print("\n\n")

const treeBuffer = writeTreeToBuffer(huffmanTree)

// header -> tree -> data length -> data
const accumulatedBuffer = buffer.create(buffer.len(headerBuffer) + buffer.len(treeBuffer) + 4 + buffer.len(huffmanEncoded.data))

buffer.copy(accumulatedBuffer, 0, headerBuffer, 0, buffer.len(headerBuffer))
buffer.copy(accumulatedBuffer, buffer.len(headerBuffer), treeBuffer, 0, buffer.len(treeBuffer))
buffer.writeu32(accumulatedBuffer, buffer.len(headerBuffer) + buffer.len(treeBuffer), huffmanEncoded.bitLength)
buffer.copy(accumulatedBuffer, buffer.len(headerBuffer) + buffer.len(treeBuffer) + 4, huffmanEncoded.data, 0, buffer.len(huffmanEncoded.data))


print("bit length: " + huffmanEncoded.bitLength)

print(string.format("Final Size : %2.f KB", buffer.len(accumulatedBuffer) / 1000))
print(string.format("Final Packets Required: %d", math.ceil(buffer.len(accumulatedBuffer) / HTTPS_BODY_LIMIT)))

const outputData = buffer.tostring(accumulatedBuffer)
const split = splitImageIntoChunks(outputData)
split.forEach((chunk,idx) => {
    print('sent ' + tostring(idx), 'size: ' + chunk.size())
    httpService.PostAsync(
        "http://127.0.0.1:5001/rorender-38b6b/us-central1/uploadRenderChunk",
        chunk,
        Enum.HttpContentType.TextPlain,
        false,
        {
            chunkId: tostring(idx),
            totalChunks: tostring(split.size()),
            pipelineId: '67af6286-0c94-431e-b358-b250d9f0fb29'
        }
    )
})

print(huffmanTree)
