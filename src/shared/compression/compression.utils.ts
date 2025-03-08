export const getCharByteValue = (char: string): number => {
    return string.byte(char)[0]
}

export function to32BitBinaryString(value: number): string {
    // Ensure the number is treated as an unsigned 32-bit integer
    const unsignedValue = value >>> 0

    let binaryString = ""
    for (let i = 31; i >= 0; i--) {
        const bit = (unsignedValue & (1 << i)) !== 0 ? "1" : "0"
        binaryString += bit
    }

    return binaryString
}
