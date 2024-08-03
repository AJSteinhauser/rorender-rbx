import { computePixel } from 'shared/render/render.utils'

export const RORENDER_FILE_VERSION = 1
export const HEADER_DATA_SIZE = 6

export interface ImageBuffers {
    header: buffer
    red: buffer
    green: buffer
    blue: buffer
    height: buffer
    material: buffer
    roads: buffer
    buildings: buffer
    water: buffer
}

export const FILE_FORMAT_DATA_ORDER: (keyof ImageBuffers)[] = [
    'header',
    'red',
    'green',
    'blue',
    'height',
    'material',
    'roads',
    'buildings',
    'water',
]
