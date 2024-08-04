export const RUN_LENGTH_BYTE_SIZE = 2
export const MAX_RUN_LENGTH = math.pow(2, 8 * RUN_LENGTH_BYTE_SIZE) - 1

export interface RunLengthSequence {
    length: number
    value: number
}

export interface ValueFrequency {
    value: number
    frequency: number
}

export interface Node {
    left?: Node
    right?: Node
    frequency: number 
    symbol?: number
}
