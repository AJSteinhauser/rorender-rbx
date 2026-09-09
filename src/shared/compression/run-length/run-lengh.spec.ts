/// <reference types="@rbxts/testez/globals" />

import {
    runLengthDecode,
    runLengthEncode,
    readRunLengthSequence
} from "./run-length-encoding.compression"
import { MAX_RUN_LENGTH, RUN_LENGTH_BYTE_SIZE } from "./run-length.model"

const RUN_LENGTH_UNIT_SIZE = RUN_LENGTH_BYTE_SIZE + 1

// Reimplementation of the old table-based decode (pre table-underflow-fix),
// kept only in this spec so the rewritten decode's output can be checked
// against it for byte-for-byte behavioral parity.
const oldRunLengthDecode = (image: buffer): buffer => {
    const runs: { length: number; value: number }[] = []
    let idx = 0
    while (idx <= buffer.len(image) - RUN_LENGTH_UNIT_SIZE) {
        runs.push(readRunLengthSequence(image, idx))
        idx += RUN_LENGTH_UNIT_SIZE
    }
    const count = runs.reduce((sum, item) => sum + item.length, 0)
    const output = buffer.create(count)
    let outIdx = 0
    runs.forEach((item) => {
        for (let i = 0; i < item.length; i++) {
            buffer.writeu8(output, outIdx + i, item.value)
        }
        outIdx += item.length
    })
    return output
}

export = () => {
    describe("Simple 1 char run length encoding", () => {
        const testString = "A"
        const input = buffer.create(1)
        buffer.writeu8(input, 0, testString.byte()[0])

        const output = buffer.create(3)
        buffer.writeu16(output, 0, 1)
        buffer.writeu8(output, 2, testString.byte()[0])

        it("should encode string", () => {
            expect(buffer.tostring(runLengthEncode(input))).to.equal(
                buffer.tostring(output)
            )
        })
        it("should decode string", () => {
            expect(buffer.tostring(runLengthDecode(output))).to.equal(
                buffer.tostring(input)
            )
        })
    })

    describe("Complicated binary string", () => {
        const testString = "AABBBBBAAABCABA"
        it("should encode and decode buffer to same string", () => {
            expect(
                buffer.tostring(
                    runLengthDecode(
                        runLengthEncode(buffer.fromstring(testString))
                    )
                )
            ).to.equal(testString)
        })
    })

    describe("runLengthDecode rewrite (buffer.fill based)", () => {
        it("should round-trip an empty buffer without throwing", () => {
            const input = buffer.create(0)
            const decoded = runLengthDecode(runLengthEncode(input))
            expect(buffer.len(decoded)).to.equal(0)
        })

        it("should round-trip a single byte", () => {
            const input = buffer.fromstring("Z")
            expect(
                buffer.tostring(runLengthDecode(runLengthEncode(input)))
            ).to.equal("Z")
        })

        it("should round-trip a long single run (exercises buffer.fill's count param)", () => {
            const testString = string.rep("Q", 5000)
            const input = buffer.fromstring(testString)
            expect(
                buffer.tostring(runLengthDecode(runLengthEncode(input)))
            ).to.equal(testString)
        })

        it("should round-trip many short runs (worst-case expansion)", () => {
            let testString = ""
            for (let i = 0; i < 1000; i++) {
                testString += i % 2 === 0 ? "A" : "B"
            }
            const input = buffer.fromstring(testString)
            const decoded = runLengthDecode(runLengthEncode(input))
            expect(buffer.len(decoded)).to.equal(testString.size())
            expect(buffer.tostring(decoded)).to.equal(testString)
        })

        it("should handle a run exactly at MAX_RUN_LENGTH", () => {
            const testString = string.rep("R", MAX_RUN_LENGTH)
            const input = buffer.fromstring(testString)
            const encoded = runLengthEncode(input)
            // A single run at exactly MAX_RUN_LENGTH should stay as one unit
            expect(buffer.len(encoded)).to.equal(RUN_LENGTH_UNIT_SIZE)
            expect(buffer.tostring(runLengthDecode(encoded))).to.equal(
                testString
            )
        })

        it("should split a run longer than MAX_RUN_LENGTH across two units", () => {
            const testString = string.rep("R", MAX_RUN_LENGTH + 1)
            const input = buffer.fromstring(testString)
            const encoded = runLengthEncode(input)
            expect(buffer.len(encoded)).to.equal(RUN_LENGTH_UNIT_SIZE * 2)
            expect(buffer.tostring(runLengthDecode(encoded))).to.equal(
                testString
            )
        })

        it("should match the old decode implementation's output across varied inputs", () => {
            const cases = [
                "",
                "A",
                string.rep("A", 300),
                "AABBBBBAAABCABA",
                string.rep("XY", 200)
            ]
            cases.forEach((testString) => {
                const encoded = runLengthEncode(buffer.fromstring(testString))
                expect(buffer.tostring(runLengthDecode(encoded))).to.equal(
                    buffer.tostring(oldRunLengthDecode(encoded))
                )
            })
        })

        it("should round-trip randomized buffers of varied run structure", () => {
            const rand = new Random()
            for (let trial = 0; trial < 20; trial++) {
                const length = rand.NextInteger(1, 500)
                let testString = ""
                let lastChar = ""
                for (let i = 0; i < length; i++) {
                    // Biased toward repeating the previous char so runs of
                    // varied length actually get exercised, not just noise.
                    const shouldRepeat = rand.NextInteger(0, 4) !== 0
                    const nextChar =
                        shouldRepeat && lastChar !== ""
                            ? lastChar
                            : string.char(rand.NextInteger(65, 70))
                    testString += nextChar
                    lastChar = nextChar
                }
                const input = buffer.fromstring(testString)
                const decoded = runLengthDecode(runLengthEncode(input))
                expect(buffer.tostring(decoded)).to.equal(testString)
            }
        })
    })
}
