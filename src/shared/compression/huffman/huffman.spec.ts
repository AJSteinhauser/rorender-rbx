/// <reference types="@rbxts/testez/globals" />
import { buildEncodingMap, buildTreeFromFrequencyTable, huffmanDecode, generatePriorityQueue, huffmanEncode } from "./huffman-encoding.compression"
import { EncodingInfo, EncodingMap, Node } from "./huffman.model"

const TEST_STRING = "AABBBBBAAABCCAAD" as const

const getCharByteValue = ( char: string ): number => {
    return string.byte(char)[0]
}

function numberToBinaryString(num: number): string {
    if (num === 0) {
        return '0';
    }
    
    let binaryString = '';
    while (num > 0) {
        binaryString = (num % 2) + binaryString;
        num = math.floor(num / 2);
    }
    
    return binaryString;
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


export = () => {
    describe("frequency table", () => {
        const expectedFrequencyTable: Node[] = [
            { frequency: 7, symbol: getCharByteValue("A") },
            { frequency: 6, symbol: getCharByteValue("B") },
            { frequency: 2, symbol: getCharByteValue("C") },
            { frequency: 1, symbol: getCharByteValue("D") },
        ]

        it("should build a frequncy table that matches expected output", () => {
            generatePriorityQueue(buffer.fromstring(TEST_STRING)).forEach((node, index) => {
                expect(node.frequency).to.equal(expectedFrequencyTable[index].frequency)
                expect(node.symbol).to.equal(expectedFrequencyTable[index].symbol)
            })
        })

        it("should build a priority queue with a length equal to the number of symbols", () => {
            expect(generatePriorityQueue(buffer.fromstring(TEST_STRING)).size()).to.equal(4)
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
        const frequencyTable = generatePriorityQueue(buffer.fromstring(TEST_STRING))
        const huffmanTree = buildTreeFromFrequencyTable(frequencyTable)

        it("should build a huffman tree that matches expected output", () => {
            expect(checkTreesAreEqual(expectedHuffmanTree, huffmanTree)).to.equal(true)
        })
    })

    describe("huffman table", () => {
        const frequencyTable = generatePriorityQueue(buffer.fromstring(TEST_STRING))
        const huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
        const huffmanTable = buildEncodingMap(huffmanTree)

        const expectedHuffmanTable: Map<number, EncodingInfo> = new Map()
        expectedHuffmanTable.set(getCharByteValue("A"), { binaryValue: 0b1, bitLength: 1 }) // 0b1)
        expectedHuffmanTable.set(getCharByteValue("B"), { binaryValue: 0b00, bitLength: 2 }) // 0b1)
        expectedHuffmanTable.set(getCharByteValue("C"), { binaryValue: 0b010, bitLength: 3 }) // 0b1)
        expectedHuffmanTable.set(getCharByteValue("D"), { binaryValue: 0b011, bitLength: 3 }) // 0b1)

        it("should encode the huffmen codes to the table", () => {
            huffmanTable.forEach((value, key) => {
                expect(value.binaryValue).to.equal(expectedHuffmanTable.get(key)?.binaryValue)
                expect(value.bitLength).to.equal(expectedHuffmanTable.get(key)?.bitLength)
            })
        })

    })

    describe("huffman encoding", () => {
        const huffmanTable: Map<number, EncodingInfo> = new Map()
        huffmanTable.set(getCharByteValue("A"), { binaryValue: 0b1, bitLength: 1 }) // 0b1)
        huffmanTable.set(getCharByteValue("B"), { binaryValue: 0b00, bitLength: 2 }) // 0b1)
        huffmanTable.set(getCharByteValue("C"), { binaryValue: 0b010, bitLength: 3 }) // 0b1)
        huffmanTable.set(getCharByteValue("D"), { binaryValue: 0b011, bitLength: 3 }) // 0b1)

        it("should encode a single character", () => {
            const encoded = huffmanEncode(buffer.fromstring("A"), huffmanTable)
            expect(buffer.readu32(encoded.data,0)).to.equal(0b10000000000000000000000000000000)
            const test2 = huffmanEncode(buffer.fromstring("C"), huffmanTable)
            expect(buffer.readu32(test2.data,0)).to.equal(0b01000000000000000000000000000000)
        })

        it("should encode multiple characters", () => {
            const encoded = huffmanEncode(buffer.fromstring("ABA"), huffmanTable)
            expect(buffer.readu32(encoded.data,0)).to.equal(0b10010000000000000000000000000000)
            const test2 = huffmanEncode(buffer.fromstring("CAB"), huffmanTable)
            expect(buffer.readu32(test2.data,0)).to.equal(0b01010000000000000000000000000000)
        })

        it("should encode a single character to the correct bit length", () => {
            const encoded = huffmanEncode(buffer.fromstring("A"), huffmanTable)
            expect(encoded.bitLength).to.equal(1)
        })

        it("should encode the test string", () => {
            const encoded = huffmanEncode(buffer.fromstring(TEST_STRING), huffmanTable)
            expect(buffer.readu32(encoded.data,0)).to.equal(0b11000000000011100010010110110000)
        })

        it("should encode the correct bit length", () => {
            const encoded = huffmanEncode(buffer.fromstring(TEST_STRING), huffmanTable)
            expect(encoded.bitLength).to.equal(28)
        })

        it("should encode 1 bit overflowing strings", () => {
            const testString = string.rep("A", 64)
            const encoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
            for (let i = 0; i < 2; i++) {
                expect(buffer.readu32(encoded.data, i * 4)).to.equal(0xFFFFFFFF)
            }
        })

        it("should encode 2 bit overflowing strings", () => {
            const testString = string.rep("B", 32)
            const encoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
            for (let i = 0; i < 2; i++) {
                expect(buffer.readu32(encoded.data, i * 4)).to.equal(0x00000000)
            }
        })

        it("should encode 3 bit overflowing strings", () => {
            const testString = string.rep("C", 1)
            const encoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
            print(numberToBinaryString(buffer.readu32(encoded.data, 0)))
            print(numberToBinaryString(buffer.readu32(encoded.data, 4)))
            expect(buffer.readu32(encoded.data, 0)).to.equal(0b01000000000000000000000000000000)
        })
    })

    describe("huffman decoding", () => {
        const frequencyTable = generatePriorityQueue(buffer.fromstring(TEST_STRING))
        const huffmanTree = buildTreeFromFrequencyTable(frequencyTable)
        const huffmanTable = buildEncodingMap(huffmanTree)

        it("should decode a single character", () => {
            const test1Encoded = huffmanEncode(buffer.fromstring("A"), huffmanTable)
            const test1Decoded = huffmanDecode(test1Encoded.data,test1Encoded.bitLength,huffmanTree)
            expect(buffer.readstring(test1Decoded,0, 1)).to.equal("A")
            const test2Encoded = huffmanEncode(buffer.fromstring("B"), huffmanTable)
            const test2Decoded = huffmanDecode(test2Encoded.data,test2Encoded.bitLength,huffmanTree)
            expect(buffer.readstring(test2Decoded,0, 1)).to.equal("B")
            const test3Encoded = huffmanEncode(buffer.fromstring("C"), huffmanTable)
            const test3Decoded = huffmanDecode(test3Encoded.data,test3Encoded.bitLength,huffmanTree)
            expect(buffer.readstring(test3Decoded,0, 1)).to.equal("C")
        })

        it("should decode multiple characters", () => {
            const test1Encoded = huffmanEncode(buffer.fromstring("AB"), huffmanTable)
            const test1Decoded = huffmanDecode(test1Encoded.data,test1Encoded.bitLength,huffmanTree)
            expect(buffer.readstring(test1Decoded, 0, 2)).to.equal("AB") // test1Decoded).to.equal("AB")
            const test2Encoded = huffmanEncode(buffer.fromstring("BAAAB"), huffmanTable)
            const test2Decoded = huffmanDecode(test2Encoded.data,test2Encoded.bitLength,huffmanTree)
            expect(buffer.readstring(test2Decoded, 0, 5)).to.equal("BAAAB") // test2Decoded).to.equal("BAAAB")
        })

        it("should decode the test string", () => {
            const testEncoded = huffmanEncode(buffer.fromstring(TEST_STRING), huffmanTable)
            const testDecoded = huffmanDecode(testEncoded.data,testEncoded.bitLength,huffmanTree)
            expect(buffer.readstring(testDecoded,0, buffer.len(testDecoded))).to.equal(TEST_STRING)
        })

        it("should decode a long string with 1 bit encoding and buffer overflow", () => {
            const testString = string.rep("A", 33)
            const testEncoded = huffmanEncode(buffer.fromstring(testString), huffmanTable)
            const testDecoded = huffmanDecode(testEncoded.data,testEncoded.bitLength,huffmanTree)
            const decoded  = buffer.readstring(testDecoded, 0, buffer.len(testDecoded))
            expect(decoded).to.equal(testString)
        })
    })
}
