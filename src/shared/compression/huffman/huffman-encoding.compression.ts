import { delayForScriptExhuastion } from "shared/render/render.utils"
import { EncodingInfo, EncodingMap, Node } from "./huffman.model"

export const huffmanEncode = (image: buffer, encodingMap: EncodingMap): buffer => {

    return image
}

export const buildEncodingMap = (node: Node): EncodingMap => {
    const huffmanMap: EncodingMap = new Map<number, EncodingInfo>()

    huffmanTreeDepthFirst(node, huffmanMap)
    return huffmanMap
}

export const huffmanTreeDepthFirst = (node: Node, map: EncodingMap, binaryValue: number = 0, bitLength: number = 0): void => {
    const isLeafNode = !node.left && !node.right 
    const symbol = node.symbol 
    if (isLeafNode && symbol !== undefined) {
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
