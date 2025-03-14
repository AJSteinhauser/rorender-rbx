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

export enum ActorHelperRequest {
    editableMesh,
    editableImage
}

export interface ActorHelperRequestPayload {
    meshPart: MeshPart
    assetId: string
}

export const VIEWFINDER_IMAGE_SIZE = new Vector2(100, 100)

export type ReplacementRayCastFunc = (
    orginal: RaycastResult,
    replacement: RaycastResult
) => void

interface SurfaceAppearanceModifiers {
    normalMap: string
    metalnessMap: string
    roughnessMap: string
    color: Color3
}

export type SurfaceOptions = Partial<SurfaceAppearanceModifiers>
