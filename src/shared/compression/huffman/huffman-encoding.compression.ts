import { delayForScriptExhuastion } from "shared/render/render.utils"
import { EncodedInfo, EncodingInfo, EncodingMap, Node } from "./huffman.model"

const writeBufferBitLength = 31 

export const huffmanEncode = (image: buffer, encodingMap: EncodingMap): EncodedInfo => {
    const bufferStore: number[] = []

    let imageIdx = 0

    let bitIdx = writeBufferBitLength
    let currentBuf = 0
    let currentBufDirty = false

    let bitLength = 0

    while (imageIdx < buffer.len(image)) {
        const symbol = buffer.readu8(image, imageIdx)
        const encodingInfo = encodingMap.get(symbol)
        if (!encodingInfo) {
            throw `Symbol: ${symbol} not found in encoding map`
        }
         
        const tmp = encodingInfo.binaryValue << (bitIdx - encodingInfo.bitLength + 1)
        currentBuf |= tmp
        bitIdx -= encodingInfo.bitLength
        currentBufDirty = true
        bitLength += encodingInfo.bitLength

        if (bitIdx >= writeBufferBitLength) {
            bufferStore.push(currentBuf)
            currentBuf = 0
            const overflowAmount = math.abs(bitIdx - writeBufferBitLength)
            currentBufDirty = false
            if (overflowAmount > 0) {
                currentBuf |= encodingInfo.binaryValue 
                currentBuf <<= overflowAmount
                bitIdx = overflowAmount
                currentBufDirty = true
            }
        }
        imageIdx++
    }
    if (currentBufDirty){
        bufferStore.push(currentBuf)
    }

    const output = buffer.create(bufferStore.size() * 4)
    bufferStore.forEach((value, idx) => {
        buffer.writeu32(output, idx * 4, value)
    })
    return { data: output, bitLength }
}

export const isLeafNode = (node: Node): boolean => {
    return !node.left && !node.right
}

export const maskOtherBits = (value: number, position: number): number => {
    if (position < 0 || position > 31) {
        throw `Invalid position: ${position}`
    }

    const mask = (1 << position) 

    return value & mask
}

export const huffmanDecode = (image: buffer, bitLength: number, encodingTree: Node): string => {
    let currentTreePos = encodingTree
    let byteIdx = 0
    let bitIdx = 0
    let currentBuffer = buffer.readu32(image, byteIdx)
    let output = ""
    let dirtyFlag = false
    while (bitIdx < bitLength) {
        if (isLeafNode(currentTreePos)){
            if (currentTreePos.symbol === undefined){
                throw `Symbol is undefined on a leaf node freq: ${currentTreePos.frequency}`
            }
            output += string.char(currentTreePos.symbol)
            currentTreePos = encodingTree
            dirtyFlag = false
        }
        const inverseBitPosition = writeBufferBitLength - bitIdx
        const value = maskOtherBits(currentBuffer,inverseBitPosition)
        bitIdx += 1
        dirtyFlag = true
        if (!currentTreePos.left || !currentTreePos.right) {
            throw `Invalid tree`
        }
        if (value === 0) { 
            currentTreePos = currentTreePos.left
        }
        else {
            currentTreePos = currentTreePos.right
        }
    }
    if (dirtyFlag){
        if (currentTreePos.symbol === undefined){
            throw `[Dirty flag] Symbol is undefined on a leaf node freq: ${currentTreePos.frequency}`
        }
        output += string.char(currentTreePos.symbol)
    }
    return output
}


export const buildEncodingMap = (node: Node): EncodingMap => {
    const huffmanMap: EncodingMap = new Map<number, EncodingInfo>()

    huffmanTreeDepthFirst(node, huffmanMap)
    return huffmanMap
}

export const huffmanTreeDepthFirst = (node: Node, map: EncodingMap, binaryValue: number = 0, bitLength: number = 0): void => {
    const isLeaf = isLeafNode(node) 
    const symbol = node.symbol 
    if (isLeaf && symbol !== undefined) {
        map.set(symbol, { binaryValue, bitLength })
    }
    if (node.left) {
        huffmanTreeDepthFirst(node.left, map, binaryValue << 1, bitLength + 1)
    }
    if (node.right) {
        huffmanTreeDepthFirst(node.right, map, binaryValue << 1 | 1, bitLength + 1)
    }
}

export const buildTreeFromFrequencyTable = (priorityQueue: Node[]): Node => {
    let root: Node | undefined = undefined
    let deferTime = tick()
    while (priorityQueue.size() > 1) {
        deferTime = delayForScriptExhuastion(deferTime)
        const right = priorityQueue.pop()
        const left = priorityQueue.pop()
        if (left && right) {
            root = { left, right, frequency: left.frequency + right.frequency }
            addNodeToPriorityQueue(root, priorityQueue)
        }
    }
    if (!root){
        error("Failed to build huffman tree")
    }
    return root
}

export const addNodeToPriorityQueue = (node: Node, priorityQueue: Node[]): void=> {
    priorityQueue.push(node)
    priorityQueue.sort((a, b) => a.frequency > b.frequency)
}

export const generatePriorityQueue = (buff: buffer): Node[]  => {
    const frequencyMap = new Map<number, number>()

    for (let i = 0; i < buffer.len(buff); i++) {
        const value = buffer.readu8(buff,i)
        const frequency = frequencyMap.get(value) || 0
        frequencyMap.set(value, frequency + 1)
    }

    const output: Node[] = []
    frequencyMap.forEach((value, key) => {
        output.push({ frequency: value, symbol: key })
    })

    output.sort((a, b) => a.frequency > b.frequency)
    return output
}
