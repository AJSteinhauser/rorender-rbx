const AUTO_ALLOCATE_SIZE = 100000

export class ScalingBuffer {
    private currentSize = 0
    private buffer: buffer

    constructor() {
        this.buffer = buffer.create(AUTO_ALLOCATE_SIZE)
    }

    public size() {
        return this.currentSize
    }

    public push_u8(value: number) {
        buffer.writeu8(this.buffer, this.currentSize, value)
        this.currentSize++
        this.checkBuffer()
    }

    public push_u16(value: number) {
        if (this.currentSize + 2 >= buffer.len(this.buffer)) {
            this.resizeBuffer()
        }
        buffer.writeu16(this.buffer, this.currentSize, value)
        this.currentSize += 2
    }

    public push_u32(value: number) {
        if (this.currentSize + 4 >= buffer.len(this.buffer)) {
            this.resizeBuffer()
        }
        buffer.writeu16(this.buffer, this.currentSize, value)
        this.currentSize += 4
    }

    private checkBuffer() {
        if (this.currentSize === buffer.len(this.buffer)) {
            this.resizeBuffer()
        }
    }

    private resizeBuffer() {
        const newBuff = buffer.create(this.currentSize + AUTO_ALLOCATE_SIZE)
        buffer.copy(newBuff, 0, this.buffer, 0, this.currentSize)
        this.buffer = newBuff
    }

    public getBuffer(): buffer {
        const returnBuff = buffer.create(this.currentSize)
        buffer.copy(returnBuff, 0, this.buffer, 0, this.currentSize)
        return returnBuff
    }
}
