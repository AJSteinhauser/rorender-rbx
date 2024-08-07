
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

export type EncodingMap = Map<number, EncodingInfo>


export interface EncodingInfo {
    bitLength: number
    binaryValue: number
}

export interface EncodedInfo {
    data: buffer
    bitLength: number
}
