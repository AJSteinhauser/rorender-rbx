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

// Used for testing / validating purposes
export const runLengthDecode = (image: buffer): buffer => {
    let idx = 0
    const runs: RunLengthSequence[] = []
    const increment = RUN_LENGTH_BYTE_SIZE + 1

    let startTime = tick()
    while (idx <= buffer.len(image) - increment) {
        startTime = delayForScriptExhuastion(startTime)
        runs.push(readRunLengthSequence(image, idx))
        idx += increment
    }

    return convertRunLengthSequenceToRawBuffer(runs) // TODO: Convert this to direct buffer manipulation; faster + less memory consumed (table underflow errors reported)
}

const convertRunLengthSequenceToRawBuffer = (
    runLengthSequence: RunLengthSequence[]
): buffer => {
    const count = runLengthSequence.reduce((sum, item) => sum + item.length, 0)
    const output = buffer.create(count)

    let idx = 0
    let startTime = tick()
    runLengthSequence.forEach((item) => {
        for (let i = 0; i < item.length; i++) {
            startTime = delayForScriptExhuastion(startTime)
            buffer.writeu8(output, idx + i, item.value)
        }
        idx += item.length
    })
    return output
}

export const convertRunLengthSequenceToEncodedBuffer = (
    runLengthSequence: RunLengthSequence[]
): buffer => {
    const output = buffer.create(
        runLengthSequence.size() * (RUN_LENGTH_BYTE_SIZE + 1)
    )
    let startTime = tick()
    runLengthSequence.forEach((item, idx) => {
        startTime = delayForScriptExhuastion(startTime)
        buffer.writeu16(output, idx * (RUN_LENGTH_BYTE_SIZE + 1), item.length)
        buffer.writeu8(output, idx * (RUN_LENGTH_BYTE_SIZE + 1) + 2, item.value)
    })
    return output
}
