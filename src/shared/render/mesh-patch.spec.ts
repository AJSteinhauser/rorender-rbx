/// <reference types="@rbxts/testez/globals" />

import { ImageBuffers } from "shared/file/file.modal"
import { writePixelToImageBuffer } from "shared/file/file.utils"
import {
    runLengthDecode,
    runLengthEncode
} from "shared/compression/run-length/run-length-encoding.compression"
import { Pixel } from "./render.model"

// Exercises the exact decode -> patch -> re-encode mechanism that
// patchRowInPlace (render.main.ts) uses to apply mesh-splice pixels onto an
// already-RLE'd row, without needing real terrain raycasting (computePixel /
// RenderConstants). Isolates the mechanism: decode each channel, write the
// patch pixel(s) via writePixelToImageBuffer, re-encode.

const bufferFromBytes = (bytes: number[]): buffer => {
    const buf = buffer.create(bytes.size())
    bytes.forEach((value, idx) => buffer.writeu8(buf, idx, value))
    return buf
}

interface Patch {
    col: number
    pixel: Pixel
}

const applyPatches = (
    originalRow: number[],
    patches: Patch[]
): { rowBuffers: ImageBuffers; encoded: ImageBuffers } => {
    const encodedRow: ImageBuffers = {
        red: runLengthEncode(bufferFromBytes(originalRow)),
        green: runLengthEncode(bufferFromBytes(originalRow)),
        blue: runLengthEncode(bufferFromBytes(originalRow)),
        height: runLengthEncode(bufferFromBytes(originalRow)),
        material: runLengthEncode(bufferFromBytes(originalRow)),
        roads: runLengthEncode(bufferFromBytes(originalRow)),
        buildings: runLengthEncode(bufferFromBytes(originalRow)),
        water: runLengthEncode(bufferFromBytes(originalRow)),
        materialsEncoding: buffer.create(0)
    }

    const rowBuffers: ImageBuffers = {
        red: runLengthDecode(encodedRow.red),
        green: runLengthDecode(encodedRow.green),
        blue: runLengthDecode(encodedRow.blue),
        height: runLengthDecode(encodedRow.height),
        material: runLengthDecode(encodedRow.material),
        roads: runLengthDecode(encodedRow.roads),
        buildings: runLengthDecode(encodedRow.buildings),
        water: runLengthDecode(encodedRow.water),
        materialsEncoding: buffer.create(0)
    }

    patches.forEach((patch) => {
        writePixelToImageBuffer(patch.col, patch.pixel, rowBuffers)
    })

    const encoded: ImageBuffers = {
        red: runLengthEncode(rowBuffers.red),
        green: runLengthEncode(rowBuffers.green),
        blue: runLengthEncode(rowBuffers.blue),
        height: runLengthEncode(rowBuffers.height),
        material: runLengthEncode(rowBuffers.material),
        roads: runLengthEncode(rowBuffers.roads),
        buildings: runLengthEncode(rowBuffers.buildings),
        water: runLengthEncode(rowBuffers.water),
        materialsEncoding: buffer.create(0)
    }

    return { rowBuffers, encoded }
}

const decodedByteAt = (encodedChannel: buffer, col: number): number =>
    buffer.readu8(runLengthDecode(encodedChannel), col)

export = () => {
    describe("decode -> patch -> re-encode row mechanism", () => {
        it("should apply a single patch and leave the rest of the row untouched", () => {
            const originalRow = [5, 5, 5, 5, 5, 5, 5, 5]
            const pixel: Pixel = {
                r: 99,
                g: 98,
                b: 97,
                h: 96,
                material: 95,
                road: 94,
                building: 93,
                water: 92
            }
            const { encoded } = applyPatches(originalRow, [{ col: 3, pixel }])

            expect(decodedByteAt(encoded.red, 3)).to.equal(99)
            expect(decodedByteAt(encoded.green, 3)).to.equal(98)
            expect(decodedByteAt(encoded.blue, 3)).to.equal(97)
            expect(decodedByteAt(encoded.height, 3)).to.equal(96)
            expect(decodedByteAt(encoded.material, 3)).to.equal(95)
            expect(decodedByteAt(encoded.roads, 3)).to.equal(94)
            expect(decodedByteAt(encoded.buildings, 3)).to.equal(93)
            expect(decodedByteAt(encoded.water, 3)).to.equal(92)

            // Unpatched columns must be untouched
            ;[0, 1, 2, 4, 5, 6, 7].forEach((col) => {
                expect(decodedByteAt(encoded.red, col)).to.equal(5)
            })
        })

        it("should apply multiple patches landing inside the same original run", () => {
            // Entire row is one uniform run, so every patch below lands
            // inside what was originally a single RLE unit.
            const originalRow = [7, 7, 7, 7, 7, 7, 7, 7]
            const patches: Patch[] = [
                {
                    col: 2,
                    pixel: {
                        r: 10,
                        g: 11,
                        b: 12,
                        h: 13,
                        material: 14,
                        road: 15,
                        building: 16,
                        water: 17
                    }
                },
                {
                    col: 3,
                    pixel: {
                        r: 20,
                        g: 21,
                        b: 22,
                        h: 23,
                        material: 24,
                        road: 25,
                        building: 26,
                        water: 27
                    }
                },
                {
                    col: 5,
                    pixel: {
                        r: 30,
                        g: 31,
                        b: 32,
                        h: 33,
                        material: 34,
                        road: 35,
                        building: 36,
                        water: 37
                    }
                }
            ]
            const { encoded } = applyPatches(originalRow, patches)

            expect(decodedByteAt(encoded.red, 2)).to.equal(10)
            expect(decodedByteAt(encoded.red, 3)).to.equal(20)
            expect(decodedByteAt(encoded.red, 5)).to.equal(30)
            ;[0, 1, 4, 6, 7].forEach((col) => {
                expect(decodedByteAt(encoded.red, col)).to.equal(7)
                expect(decodedByteAt(encoded.water, col)).to.equal(7)
            })
        })

        it("should apply patches at the first and last column of the row", () => {
            const originalRow = [1, 2, 3, 4, 5]
            const firstPixel: Pixel = {
                r: 200,
                g: 200,
                b: 200,
                h: 200,
                material: 200,
                road: 200,
                building: 200,
                water: 200
            }
            const lastPixel: Pixel = {
                r: 201,
                g: 201,
                b: 201,
                h: 201,
                material: 201,
                road: 201,
                building: 201,
                water: 201
            }
            const { encoded } = applyPatches(originalRow, [
                { col: 0, pixel: firstPixel },
                { col: 4, pixel: lastPixel }
            ])

            expect(decodedByteAt(encoded.red, 0)).to.equal(200)
            expect(decodedByteAt(encoded.red, 4)).to.equal(201)
            expect(decodedByteAt(encoded.red, 1)).to.equal(2)
            expect(decodedByteAt(encoded.red, 2)).to.equal(3)
            expect(decodedByteAt(encoded.red, 3)).to.equal(4)
        })

        it("should apply patches landing in different original runs", () => {
            const originalRow = [1, 1, 1, 2, 2, 3, 3, 3, 3]
            const patchA: Pixel = {
                r: 50,
                g: 50,
                b: 50,
                h: 50,
                material: 50,
                road: 50,
                building: 50,
                water: 50
            }
            const patchB: Pixel = {
                r: 60,
                g: 60,
                b: 60,
                h: 60,
                material: 60,
                road: 60,
                building: 60,
                water: 60
            }
            const { encoded } = applyPatches(originalRow, [
                { col: 1, pixel: patchA }, // inside the run of 1s
                { col: 6, pixel: patchB } // inside the run of 3s
            ])

            expect(decodedByteAt(encoded.red, 1)).to.equal(50)
            expect(decodedByteAt(encoded.red, 6)).to.equal(60)
            expect(decodedByteAt(encoded.red, 0)).to.equal(1)
            expect(decodedByteAt(encoded.red, 2)).to.equal(1)
            expect(decodedByteAt(encoded.red, 3)).to.equal(2)
            expect(decodedByteAt(encoded.red, 4)).to.equal(2)
            expect(decodedByteAt(encoded.red, 5)).to.equal(3)
            expect(decodedByteAt(encoded.red, 7)).to.equal(3)
            expect(decodedByteAt(encoded.red, 8)).to.equal(3)
        })
    })
}
