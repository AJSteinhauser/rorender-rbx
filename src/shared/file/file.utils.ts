import { Settings } from "shared/settings/settings.model"
import {
    FILE_FORMAT_DATA_ORDER,
    HEADER_DATA_SIZE,
    ImageBuffers,
    RORENDER_FILE_VERSION,
    STRING_ENCODING_SEPERATOR
} from "./file.modal"
import { getImageDimensions } from "shared/utils"
import { Pixel } from "shared/render/render.model"

export function writeHeader(renderSettings: Settings): buffer {
    const imageSize = getImageDimensions(renderSettings)
    const buf = buffer.create(HEADER_DATA_SIZE)
    let offset = 0
    const writeU16ValueToHeaderBuffer = (value: number) => {
        buffer.writeu16(buf, offset, value)
        offset += 2
    }
    const writeFloat32ValueToHeaderBuffer = (value: number) => {
        buffer.writef32(buf, offset, value)
        offset += 4
    }
    const writeVector3ToHeader = (vec: Vector3) => {
        writeFloat32ValueToHeaderBuffer(vec.X)
        writeFloat32ValueToHeaderBuffer(vec.Y)
        writeFloat32ValueToHeaderBuffer(vec.Z)
    }
    writeU16ValueToHeaderBuffer(RORENDER_FILE_VERSION)
    writeU16ValueToHeaderBuffer(imageSize.X)
    writeU16ValueToHeaderBuffer(imageSize.Y)

    writeVector3ToHeader(renderSettings.mapCFrame.Position)
    writeVector3ToHeader(renderSettings.mapScale)

    const orientation = renderSettings.mapCFrame.ToEulerAnglesXYZ()
    writeVector3ToHeader(
        new Vector3(orientation[0], orientation[1], orientation[2])
    )

    return buf
}

function generateStringEncodings(settings: Settings): buffer {
    const materials = Enum.Material.GetEnumItems()
        .map((x) => x.Name)
        .join(",")
    const buildingGroups = settings.buildingGroups.map((x) => x.name).join(",")
    const roadGroups = settings.roadGroups.map((x) => x.name).join(",")

    const output =
        `${materials}${STRING_ENCODING_SEPERATOR}` +
        `${buildingGroups}${STRING_ENCODING_SEPERATOR}` +
        `${roadGroups}`
    return buffer.fromstring(output)
}

export const generateBufferChannels = (
    settings: Settings,
    isRow: boolean = false
): ImageBuffers => {
    const imageSize = getImageDimensions(settings)
    const bytesPerChannel = isRow ? imageSize.X : imageSize.X * imageSize.Y
    if (bytesPerChannel * 8 > 1073741824) {
        warn(
            "Current max image size is 1GB, or 11,585px x 11,585px. If your use case requires a larger image, please make a feature request at rorender.com/support. In the meantime consider tiling your map into smaller chunks to achieve desired resolution."
        )
        throw "Image too large"
    }
    return {
        red: buffer.create(bytesPerChannel),
        green: buffer.create(bytesPerChannel),
        blue: buffer.create(bytesPerChannel),
        height: buffer.create(bytesPerChannel),
        material: buffer.create(bytesPerChannel),
        roads: buffer.create(bytesPerChannel),
        buildings: buffer.create(bytesPerChannel),
        water: buffer.create(bytesPerChannel),
        materialsEncoding: generateStringEncodings(settings)
    }
}

export const writePixelToImageBuffer = (
    offset: number,
    pixel: Pixel,
    imageBuffers: ImageBuffers
): void => {
    buffer.writeu8(imageBuffers.red, offset, pixel.r)
    buffer.writeu8(imageBuffers.green, offset, pixel.g)
    buffer.writeu8(imageBuffers.blue, offset, pixel.b)
    buffer.writeu8(imageBuffers.height, offset, pixel.h)
    buffer.writeu8(imageBuffers.material, offset, pixel.material)
    buffer.writeu8(imageBuffers.roads, offset, pixel.road)
    buffer.writeu8(imageBuffers.buildings, offset, pixel.building)
    buffer.writeu8(imageBuffers.water, offset, pixel.water)
}

const getFileSizeFromBuffers = (imageBuffers: ImageBuffers): number => {
    let output = 0
    for (let key of FILE_FORMAT_DATA_ORDER) {
        output += buffer.len(imageBuffers[key])
    }
    return output
}

export const mergeImageBuffersIntoSingleBuffer = (
    imageData: ImageBuffers
): buffer => {
    let totalSize = getFileSizeFromBuffers(imageData)
    const output = buffer.create(totalSize)

    let currentOffset = 0
    for (let item of FILE_FORMAT_DATA_ORDER) {
        buffer.copy(
            output,
            currentOffset,
            imageData[item],
            0,
            buffer.len(imageData[item])
        )
        currentOffset += buffer.len(imageData[item])
    }
    return output
}
