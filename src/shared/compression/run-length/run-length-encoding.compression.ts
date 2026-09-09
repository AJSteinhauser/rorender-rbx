import { delayForScriptExhuastion } from "shared/render/render.utils"
import {
    MAX_RUN_LENGTH,
    RUN_LENGTH_BYTE_SIZE,
    RunLengthSequence
} from "./run-length.model"
import { ScalingBuffer } from "../autoscaling-buffer.util"

export const runLengthEncode = (image: buffer): buffer => {
    let idx = 0
    const scalingBuffer = new ScalingBuffer()

    const addRunLength = (length: number, value: number) => {
        scalingBuffer.push_u16(length)
        scalingBuffer.push_u8(value)
    }

    let current = buffer.readu8(image, idx)
    let count = 1

    let wastedCount = 0

    let startTime = tick()
    while (idx < buffer.len(image) - 1) {
        startTime = delayForScriptExhuastion(startTime)
        const nextValue = buffer.readu8(image, idx + 1)
        if (current === nextValue && count < MAX_RUN_LENGTH) {
            count++
        } else {
            addRunLength(count, current)
            if (count < 128) {
                wastedCount += 1
            }
            current = nextValue
            count = 1
        }
        idx++
    }

    addRunLength(count, current)
    return scalingBuffer.getBuffer()
}

export const readRunLengthSequence = (
    image: buffer,
    idx: number
): RunLengthSequence => {
    const length = buffer.readu16(image, idx)
    const value = buffer.readu8(image, idx + 2)

    return { length, value }
}

const RUN_LENGTH_UNIT_SIZE = RUN_LENGTH_BYTE_SIZE + 1

export const runLengthDecode = (image: buffer): buffer => {
    const imageLength = buffer.len(image)

    let totalLength = 0
    let startTime = tick()
    for (
        let idx = 0;
        idx + RUN_LENGTH_UNIT_SIZE <= imageLength;
        idx += RUN_LENGTH_UNIT_SIZE
    ) {
        startTime = delayForScriptExhuastion(startTime)
        totalLength += buffer.readu16(image, idx)
    }

    const output = buffer.create(totalLength)

    let outIdx = 0
    startTime = tick()
    for (
        let idx = 0;
        idx + RUN_LENGTH_UNIT_SIZE <= imageLength;
        idx += RUN_LENGTH_UNIT_SIZE
    ) {
        startTime = delayForScriptExhuastion(startTime)
        const { length, value } = readRunLengthSequence(image, idx)
        buffer.fill(output, outIdx, value, length)
        outIdx += length
    }

    return output
}
