import { delayForScriptExhuastion } from "shared/render/render.utils"
import { Node, ValueFrequency } from "./compression.model"


let totalCount = 0

export const hoffmanEncode = (image: buffer): buffer => {
    return image
}

export const buildEncodingMap = (node: Node): Map<number, string> => {
    const huffmanMap = new Map<number, string>()

    huffmanTreeDepthFirst(node, huffmanMap)
    print(math.ceil(totalCount/8) / 1000, "KB Huffman")
    return huffmanMap
}

export const huffmanTreeDepthFirst = (node: Node, map: Map<number, string>, currentInput: string = ""): void => {
    const isLeafNode = !node.left && !node.right 
    const symbol = node.symbol 
    if (isLeafNode && symbol !== undefined) {
        map.set(symbol, currentInput)
        totalCount += currentInput.size() * node.frequency
    }
    if (node.left) {
        huffmanTreeDepthFirst(node.left, map, currentInput + "0")
    }
    if (node.right) {
        huffmanTreeDepthFirst(node.right, map, currentInput + "1")
    }
}


export const buildTreeFromFrequencyTable = (priorityQueue: Node[]): Node => {
    let root: Node | undefined = undefined
    let deferTime = tick()
    while (priorityQueue.size() > 1) {
        deferTime = delayForScriptExhuastion(deferTime)
        const left = priorityQueue.pop()
        const right = priorityQueue.pop()
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
