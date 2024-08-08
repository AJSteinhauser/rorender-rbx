import { delayForScriptExhuastion } from "shared/render/render.utils"
import { EncodedInfo, EncodingInfo, EncodingMap, Node } from "./huffman.model"
import { to32BitBinaryString } from "../compression.utils"

const writeBufferBitLength = 31 

export const huffmanEncode = (image: buffer, encodingMap: EncodingMap): EncodedInfo => {
    const bufferStore: number[] = []

    let symbolIdx = 0
    let leftBitIdx = writeBufferBitLength
    let currentBuf = 0
    let currentBufDirty = false

    let bitCounter = 0

    while (symbolIdx < buffer.len(image)) {
        const preOperationSpaceRemaining = leftBitIdx + 1
        const symbol = buffer.readu8(image, symbolIdx)
        const encodingInfo = encodingMap.get(symbol)
        if (!encodingInfo) {
            throw `Symbol: ${symbol} not found in encoding map`
        }
        currentBuf |= encodingInfo.binaryValue << (leftBitIdx - encodingInfo.bitLength + 1)

        leftBitIdx -= encodingInfo.bitLength
        currentBufDirty = true
        bitCounter += encodingInfo.bitLength

        if (leftBitIdx < 0) {
            bufferStore.push(currentBuf)
            currentBuf = 0
            const overflowAmount = math.abs(preOperationSpaceRemaining - encodingInfo.bitLength)

            currentBufDirty = false
            leftBitIdx = writeBufferBitLength
            if (overflowAmount > 0) {
                currentBuf |= encodingInfo.binaryValue 
                const shiftAmount = writeBufferBitLength - (overflowAmount - 1)
                currentBuf <<= shiftAmount
                leftBitIdx = writeBufferBitLength - overflowAmount
                currentBufDirty = true
            }
        }
        symbolIdx++
    }
    if (currentBufDirty){
        bufferStore.push(currentBuf)
    }

    const output = buffer.create(bufferStore.size() * 4)
    bufferStore.forEach((value, idx) => {
        buffer.writeu32(output, idx * 4, value)
    })
    return { data: output, bitLength: bitCounter }
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

export const huffmanDecode = (image: buffer, bitLength: number, encodingTree: Node): buffer => {
    let currentTreePos = encodingTree
    let byteIdx = 0
    let overallBitIdx = 0
    let subBitIdx = 31
    let currentBuffer = buffer.readu32(image, byteIdx)
    let output = ""
    while (overallBitIdx < bitLength) {
        const value = maskOtherBits(currentBuffer,subBitIdx)
        overallBitIdx += 1
        subBitIdx -= 1
        if (!currentTreePos.left || !currentTreePos.right) {
            throw `Invalid tree`
        }
        if (value === 0) { 
            currentTreePos = currentTreePos.left
        }
        else {
            currentTreePos = currentTreePos.right
        }
        if (isLeafNode(currentTreePos)){
            if (currentTreePos.symbol === undefined){
                throw `Symbol is undefined on a leaf node freq: ${currentTreePos.frequency}`
            }
            output += string.char(currentTreePos.symbol)
            currentTreePos = encodingTree
        }
        if (subBitIdx < 0 && overallBitIdx < bitLength){
            byteIdx += 4
            currentBuffer = buffer.readu32(image, byteIdx)
            subBitIdx = 31
        }
    }
    // if (dirtyFlag){
    //     if (currentTreePos.symbol === undefined){
    //         throw `[Dirty flag] Symbol is undefined on a leaf node freq: ${currentTreePos.frequency}`
    //     }
    //     output += string.char(currentTreePos.symbol)
    // }
    const outputBuf = buffer.create(output.size())
    buffer.writestring(outputBuf,0, output, output.size())
    return outputBuf
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
