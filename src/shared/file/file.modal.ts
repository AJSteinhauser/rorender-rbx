export const RORENDER_FILE_VERSION = 2
export const HEADER_DATA_SIZE = 42
export const STRING_ENCODING_SEPERATOR = "@#%"

export interface ImageBuffers {
    red: buffer
    green: buffer
    blue: buffer
    height: buffer
    material: buffer
    roads: buffer
    buildings: buffer
    water: buffer
    materialsEncoding: buffer
}

export const FILE_FORMAT_DATA_ORDER: (keyof ImageBuffers)[] = [
    "red",
    "green",
    "blue",
    "height",
    "material",
    "roads",
    "buildings",
    "water",
    "materialsEncoding"
]

export type RasterChannel = Exclude<keyof ImageBuffers, "materialsEncoding">

export const RASTER_CHANNEL_ORDER = FILE_FORMAT_DATA_ORDER.filter(
    (key): key is RasterChannel => key !== "materialsEncoding"
)

export type RleRowBuffers = {
    [K in RasterChannel]: buffer[]
}

export type RleRow = {
    [K in RasterChannel]: buffer
}
