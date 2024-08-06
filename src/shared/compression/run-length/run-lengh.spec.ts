/// <reference types="@rbxts/testez/globals" />

import { runLengthDecode, runLengthEncode } from "./run-length-encoding.compression"

export = () => {
    describe("Simple 1 char run length encoding", () => {
        const testString = "A"
        const input = buffer.create(1)
        buffer.writeu8(input, 0, testString.byte()[0])

        const output = buffer.create(3)
        buffer.writeu16(output, 0, 1)
        buffer.writeu8(output, 2, testString.byte()[0])

        it("should encode string", () => {
            expect(buffer.tostring(runLengthEncode(input))).to.equal(buffer.tostring(output))
        })
        it("should decode string", () => {
            expect(buffer.tostring(runLengthDecode(output))).to.equal(buffer.tostring(input))
        })
    })

    describe("Complicated binary string", () => {
        const testString = "AABBBBBAAABCABA"
        it("should encode and decode buffer to same string", () => {
            expect(buffer.tostring(runLengthDecode(runLengthEncode(buffer.fromstring(testString))))).to.equal(testString)
        })
    })
}
