
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
