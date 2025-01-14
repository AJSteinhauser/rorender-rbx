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
    imageDimensions: Vector2
    startingPosition: CFrame
    materialMap: Map<Enum.Material, number>
}

