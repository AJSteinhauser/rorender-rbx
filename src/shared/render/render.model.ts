export interface Pixel {
    r: number
    g: number
    b: number
    h: number //height
    material: number
    road: number
    building: number
    water: number
}

export interface RenderConstants {
    rayVector: Vector3
    rayLength: number
    xSpacing: number
    ySpacing: number
    imageDimensions: Vector2
    rayBottom: number
    normalizedRayTop: number
    materialMap: Map<number, number>
}

