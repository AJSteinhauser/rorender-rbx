/// <reference types="@rbxts/testez/globals" />

import { buildEncodingMap, buildTreeFromFrequencyTable, generatePriorityQueue, huffmanEncode } from "./huffman-encoding.compression"
import { EncodingInfo, EncodingMap, Node } from "./huffman.model"


const getCharByteValue = ( char: string ): number => {
    return string.byte(char)[0]
}

const checkTreesAreEqual = (tree1: Node | undefined, tree2: Node | undefined): boolean => {
    if (tree1 === undefined && tree2 === undefined) {
        return true
    } else if ((tree1 === undefined) !== (tree2 === undefined)) {
        return false
    }
    if (!tree1 || !tree2) { // Only for typechecker to shutup
        return false
    }
    if ((tree1.frequency !== tree2.frequency) !== (tree1.symbol !== tree2.symbol)) {
        return false
    } else {
        return checkTreesAreEqual(tree1.left, tree2.left) && checkTreesAreEqual(tree1.right, tree2.right)
    }
}

const testString = "AABBBBBAAABCCAAD" as const

export = () => {
    describe("frequency table", () => {
        const expectedFrequencyTable: Node[] = [
            { frequency: 7, symbol: getCharByteValue("A") },
            { frequency: 6, symbol: getCharByteValue("B") },
            { frequency: 2, symbol: getCharByteValue("C") },
            { frequency: 1, symbol: getCharByteValue("D") },
        ]

        it("should build a frequncy table that matches expected output", () => {
            generatePriorityQueue(buffer.fromstring(testString)).forEach((node, index) => {
                expect(node.frequency).to.equal(expectedFrequencyTable[index].frequency)
                expect(node.symbol).to.equal(expectedFrequencyTable[index].symbol)
            })
        })

        it("should build a priority queue with a length equal to the number of symbols", () => {
            expect(generatePriorityQueue(buffer.fromstring(testString)).size()).to.equal(4)
        })
    })

    describe("huffman tree", () => {
        const expectedHuffmanTree: Node = {
            frequency: 16,
            right: { frequency: 7, symbol: getCharByteValue("A") },
            left: {
                frequency: 9,
                left: { frequency: 6, symbol: getCharByteValue("B") },
                right: {
                    frequency: 3,
                    left: { frequency: 2, symbol: getCharByteValue("C") },
                    right: { frequency: 1, symbol: getCharByteValue("D") },
                },
            },
        }
        const frequencyTable = generatePriorityQueue(buffer.fromstring(testString))
        const huffmanTree = buildTreeFromFrequencyTable(frequencyTable)

        it("should build a huffman tree that matches expected output", () => {
            expect(checkTreesAreEqual(expectedHuffmanTree, huffmanTree)).to.equal(true)
        })
    })

    describe("huffman table", () => {
        const frequencyTable = generatePriorityQueue(buffer.fromstring(testString))
        const huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
        const huffmanTable = buildEncodingMap(huffmanTree)

        const expectedHuffmanTable: Map<number, EncodingInfo> = new Map()
        expectedHuffmanTable.set(getCharByteValue("A"), { binaryValue: 0b1, bitLength: 1 }) // 0b1)
        expectedHuffmanTable.set(getCharByteValue("B"), { binaryValue: 0b00, bitLength: 2 }) // 0b1)
        expectedHuffmanTable.set(getCharByteValue("C"), { binaryValue: 0b010, bitLength: 3 }) // 0b1)
        expectedHuffmanTable.set(getCharByteValue("D"), { binaryValue: 0b011, bitLength: 3 }) // 0b1)

        print(expectedHuffmanTable)
        print(huffmanTable)
        it("should encode the huffmen codes to the table", () => {
            huffmanTable.forEach((value, key) => {
                expect(value.binaryValue).to.equal(expectedHuffmanTable.get(key)?.binaryValue)
                expect(value.bitLength).to.equal(expectedHuffmanTable.get(key)?.bitLength)
            })
        })

    })

    describe("huffman encoding", () => {
        const frequencyTable = generatePriorityQueue(buffer.fromstring(testString))
        const huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
        const huffmanTable = buildEncodingMap(huffmanTree)

        it("should encode a string to match the expect example encoding", () => {
            const huffmanEncoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
        })

    })
}
