import { HEADER_DATA_SIZE } from 'shared/file/file.modal'
import { MAX_RUN_LENGTH, RUN_LENGTH_BYTE_SIZE, RunLengthSequence } from './compression.model'

export const runLengthEncode = (image: buffer): buffer => {
    let idx = 0
    const runs: RunLengthSequence[] = []

    let current = buffer.readu8(image, idx)
    let count = 1

    while (idx < buffer.len(image) - 1) {
        const nextValue = buffer.readu8(image, idx + 1)
        if (current === nextValue && count < MAX_RUN_LENGTH) {
            count++
        } else {
            runs.push({ value: current, length: count })
            current = nextValue
            count = 1
        }
        idx++
    }
    runs.push({ value: current, length: count })
    return convertRunLengthSequenceToEncodedBuffer(runs)
}

export const readRunLengthSequence = (image: buffer, idx: number): RunLengthSequence => {
    const length = buffer.readu16(image, idx)
    const value = buffer.readu8(image, idx + 2)

    return { length, value }
}

// Used for testing / validating purposes
export const runLengthDecode = (image: buffer): buffer => {
    let idx = 0
    const runs: RunLengthSequence[] = []
    const increment = RUN_LENGTH_BYTE_SIZE + 1

    while (idx <= buffer.len(image) - increment) {
        runs.push(readRunLengthSequence(image, idx))
        idx += increment
    }

    return convertRunLengthSequenceToRawBuffer(runs)
}

const convertRunLengthSequenceToRawBuffer = (runLengthSequence: RunLengthSequence[]): buffer => {
    const count = runLengthSequence.reduce((sum, item) => sum + item.length, 0)
    const output = buffer.create(count)

    let idx = 0
    runLengthSequence.forEach(item => {
        for (let i = 0; i < item.length; i++) {
            buffer.writeu8(output, idx + i, item.value)
        }
        idx += item.length
    })

    return output
}

const convertRunLengthSequenceToEncodedBuffer = (runLengthSequence: RunLengthSequence[]): buffer => {
    const output = buffer.create(runLengthSequence.size() * (RUN_LENGTH_BYTE_SIZE + 1))
    runLengthSequence.forEach((item, idx) => {
        buffer.writeu16(output, idx * (RUN_LENGTH_BYTE_SIZE + 1), item.length)
        buffer.writeu8(output, idx * (RUN_LENGTH_BYTE_SIZE + 1) + 2, item.value)
    })
    return output
}
