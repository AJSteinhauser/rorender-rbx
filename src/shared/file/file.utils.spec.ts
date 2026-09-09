/// <reference types="@rbxts/testez/globals" />

import {
    assembleFinalRleBuffer,
    generateEmptyRleRowBuffers,
    mergeImageBuffersIntoSingleBuffer
} from "./file.utils"
import {
    ImageBuffers,
    RASTER_CHANNEL_ORDER,
    RasterChannel,
    RleRowBuffers
} from "./file.modal"
import {
    runLengthDecode,
    runLengthEncode
} from "shared/compression/run-length/run-length-encoding.compression"

const bufferFromBytes = (bytes: number[]): buffer => {
    const buf = buffer.create(bytes.size())
    bytes.forEach((value, idx) => buffer.writeu8(buf, idx, value))
    return buf
}

// Builds a full raw ImageBuffers (row-major within each channel, matching
// how the row-compute pipeline lays bytes out) from a 2D [row][col] grid,
// with a distinct per-channel offset so a channel-order bug is detectable.
const buildFullImageBuffers = (
    rows: number[][],
    materialsEncoding: buffer
): ImageBuffers => {
    const channelOffset: Record<RasterChannel, number> = {
        red: 0,
        green: 1,
        blue: 2,
        height: 3,
        material: 4,
        roads: 5,
        buildings: 6,
        water: 7
    }
    const buildChannel = (offset: number): buffer => {
        const bytes: number[] = []
        rows.forEach((row) =>
            row.forEach((value) => bytes.push((value + offset) % 256))
        )
        return bufferFromBytes(bytes)
    }
    return {
        red: buildChannel(channelOffset.red),
        green: buildChannel(channelOffset.green),
        blue: buildChannel(channelOffset.blue),
        height: buildChannel(channelOffset.height),
        material: buildChannel(channelOffset.material),
        roads: buildChannel(channelOffset.roads),
        buildings: buildChannel(channelOffset.buildings),
        water: buildChannel(channelOffset.water),
        materialsEncoding
    }
}

// Builds the equivalent per-row-RLE'd representation from the same grid,
// mirroring how render()'s row-completion handler RLE-encodes each row.
const buildRleRows = (rows: number[][]): RleRowBuffers => {
    const channelOffset: Record<RasterChannel, number> = {
        red: 0,
        green: 1,
        blue: 2,
        height: 3,
        material: 4,
        roads: 5,
        buildings: 6,
        water: 7
    }
    const output = generateEmptyRleRowBuffers()
    for (let channel of RASTER_CHANNEL_ORDER) {
        const offset = channelOffset[channel]
        rows.forEach((row, rowIndex) => {
            const rowBytes = row.map((value) => (value + offset) % 256)
            output[channel][rowIndex] = runLengthEncode(
                bufferFromBytes(rowBytes)
            )
        })
    }
    return output
}

export = () => {
    describe("generateEmptyRleRowBuffers", () => {
        it("should return an empty array for every raster channel", () => {
            const rows = generateEmptyRleRowBuffers()
            for (let channel of RASTER_CHANNEL_ORDER) {
                expect(rows[channel].size()).to.equal(0)
            }
        })
    })

    describe("assembleFinalRleBuffer", () => {
        it("should match the old merge-then-RLE pipeline for varied content", () => {
            const rows = [
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 250, 251, 252]
            ]
            const materialsEncoding = buffer.fromstring("abc")

            const oldStyle = runLengthEncode(
                mergeImageBuffersIntoSingleBuffer(
                    buildFullImageBuffers(rows, materialsEncoding)
                )
            )
            const newStyle = assembleFinalRleBuffer(
                buildRleRows(rows),
                materialsEncoding
            )

            expect(buffer.tostring(newStyle)).to.equal(
                buffer.tostring(oldStyle)
            )
        })

        it("should match the old pipeline for a larger 10x10 image", () => {
            const rows: number[][] = []
            for (let row = 0; row < 10; row++) {
                const cols: number[] = []
                for (let col = 0; col < 10; col++) {
                    cols.push((row * 7 + col * 3) % 256)
                }
                rows.push(cols)
            }
            const materialsEncoding = buffer.fromstring(
                "Concrete,Grass@#%A@#%B"
            )

            const oldStyle = runLengthEncode(
                mergeImageBuffersIntoSingleBuffer(
                    buildFullImageBuffers(rows, materialsEncoding)
                )
            )
            const newStyle = assembleFinalRleBuffer(
                buildRleRows(rows),
                materialsEncoding
            )

            expect(buffer.tostring(newStyle)).to.equal(
                buffer.tostring(oldStyle)
            )
        })

        it("should handle a single-row, single-pixel image", () => {
            const rows = [[42]]
            const materialsEncoding = buffer.fromstring("x")

            const oldStyle = runLengthEncode(
                mergeImageBuffersIntoSingleBuffer(
                    buildFullImageBuffers(rows, materialsEncoding)
                )
            )
            const newStyle = assembleFinalRleBuffer(
                buildRleRows(rows),
                materialsEncoding
            )

            expect(buffer.tostring(newStyle)).to.equal(
                buffer.tostring(oldStyle)
            )
        })

        it("should lay channels out in channel-major, row-minor order", () => {
            const rowCount = 3
            const rowWidth = 4
            const constantPerChannel: Record<RasterChannel, number> = {
                red: 10,
                green: 20,
                blue: 30,
                height: 40,
                material: 50,
                roads: 60,
                buildings: 70,
                water: 80
            }
            const rleRows = generateEmptyRleRowBuffers()
            for (let channel of RASTER_CHANNEL_ORDER) {
                const value = constantPerChannel[channel]
                for (let row = 0; row < rowCount; row++) {
                    const rowBytes: number[] = []
                    for (let col = 0; col < rowWidth; col++) {
                        rowBytes.push(value)
                    }
                    rleRows[channel][row] = runLengthEncode(
                        bufferFromBytes(rowBytes)
                    )
                }
            }
            const materialsEncoding = buffer.fromstring("abc")

            const assembled = assembleFinalRleBuffer(rleRows, materialsEncoding)

            // The whole assembled buffer is one uniform RLE stream (the
            // decoder has no row/channel boundary awareness), so decoding
            // it as a single unit must reproduce channel-major/row-minor
            // raw bytes followed by the (also RLE'd) materialsEncoding.
            const decoded = runLengthDecode(assembled)

            const channelSize = rowCount * rowWidth
            let offset = 0
            for (let channel of RASTER_CHANNEL_ORDER) {
                const expectedValue = constantPerChannel[channel]
                for (let i = 0; i < channelSize; i++) {
                    expect(buffer.readu8(decoded, offset + i)).to.equal(
                        expectedValue
                    )
                }
                offset += channelSize
            }
            const materialsTail = buffer.readstring(
                decoded,
                offset,
                buffer.len(decoded) - offset
            )
            expect(materialsTail).to.equal("abc")
        })

        it("should produce identical output regardless of row assignment order", () => {
            const rows = [
                [1, 2],
                [3, 4],
                [5, 6]
            ]
            const materialsEncoding = buffer.fromstring("m")

            const sequential = generateEmptyRleRowBuffers()
            for (let channel of RASTER_CHANNEL_ORDER) {
                rows.forEach((row, rowIndex) => {
                    sequential[channel][rowIndex] = runLengthEncode(
                        bufferFromBytes(row)
                    )
                })
            }

            const shuffled = generateEmptyRleRowBuffers()
            const assignmentOrder = [2, 0, 1]
            for (let channel of RASTER_CHANNEL_ORDER) {
                assignmentOrder.forEach((rowIndex) => {
                    shuffled[channel][rowIndex] = runLengthEncode(
                        bufferFromBytes(rows[rowIndex])
                    )
                })
            }

            const sequentialOutput = assembleFinalRleBuffer(
                sequential,
                materialsEncoding
            )
            const shuffledOutput = assembleFinalRleBuffer(
                shuffled,
                materialsEncoding
            )

            expect(buffer.tostring(shuffledOutput)).to.equal(
                buffer.tostring(sequentialOutput)
            )
        })
    })
}
