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

export interface HeightPrepassGrid {
    cellPixelSize: number
    cellsX: number
    cellsZ: number
    shifts: number[]
}

export interface RenderConstants {
    rayVector: Vector3
    rayUnit: Vector3
    rayLength: number
    imageDimensions: Vector2
    startingPosition: CFrame
    materialMap: Map<Enum.Material, number>
    sharedCaches: {
        roadCache: Map<Instance, number>
        buildingCache: Map<Instance, number>
    }
    heightPrepass?: HeightPrepassGrid
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
export const VIEWFINDER_POPOUT_IMAGE_SIZE = new Vector2(1024, 1024)

export interface ParsedRenderId {
    rawId: string // full input string passed as pipelineId
    uuid: string // UUID portion only (no suffix)
    destination: "rorender" | "rosa"
    renderType: "simple" | "complex"
}

// UUID-XX where XX is a hex byte; bit 0 = destination (0=rorender, 1=rosa), bit 1 = type (0=complex, 1=simple)
export function parseRenderId(input: string): ParsedRenderId | undefined {
    const withSuffix = input.match(
        "^(%x%x%x%x%x%x%x%x%-%x%x%x%x%-4%x%x%x%-[89abAB]%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x)%-(%x%x)$"
    )
    if (withSuffix.size() >= 2) {
        const uuid = withSuffix[0] as string
        const hexStr = withSuffix[1] as string
        const flags = tonumber(hexStr, 16) ?? 0
        return {
            rawId: input,
            uuid,
            destination: (flags & 1) !== 0 ? "rosa" : "rorender",
            renderType: (flags & 2) !== 0 ? "simple" : "complex"
        }
    }
    const plainUUID = input.match(
        "^%x%x%x%x%x%x%x%x%-%x%x%x%x%-4%x%x%x%-[89abAB]%x%x%x%-%x%x%x%x%x%x%x%x%x%x%x%x$"
    )
    if (plainUUID.size() > 0) {
        return {
            rawId: input,
            uuid: input,
            destination: "rorender",
            renderType: "complex"
        }
    }
    return undefined
}

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
