import { Settings } from "shared/settings/settings.model"
import { HeightPrepassGrid } from "./render.model"
import { delayForScriptExhuastion } from "./render.utils"

export type Blockcaster = (
    origin: CFrame,
    size: Vector3,
    direction: Vector3,
    params: RaycastParams
) => RaycastResult | undefined

const workspaceBlockcast: Blockcaster = (origin, size, direction, params) =>
    game.Workspace.Blockcast(origin, size, direction, params)

export const HEIGHT_PREPASS_CELL_WORLD_SIZE = 15
const HEIGHT_PREPASS_FOOTPRINT_OVERLAP = 1.5
const HEIGHT_PREPASS_BOX_THICKNESS = 1
export const MAX_SHAPECAST_DISTANCE = 1024
export const MAX_SHAPECAST_SEGMENTS = 16
export const HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL = 256
export const HEIGHT_PREPASS_BAIL_MISS_RATIO = 0.9

export function chainedBlockcast(
    origin: CFrame,
    size: Vector3,
    direction: Vector3,
    params: RaycastParams,
    blockcast: Blockcaster = workspaceBlockcast
): RaycastResult | undefined {
    const unit = direction.Unit
    let remaining = direction.Magnitude
    let segmentOrigin = origin
    for (
        let segment = 0;
        segment < MAX_SHAPECAST_SEGMENTS && remaining > 0;
        segment++
    ) {
        const segmentLength = math.min(remaining, MAX_SHAPECAST_DISTANCE)
        const segmentVector = unit.mul(segmentLength)
        const hit = blockcast(segmentOrigin, size, segmentVector, params)
        if (hit) return hit
        segmentOrigin = segmentOrigin.add(segmentVector)
        remaining -= segmentLength
    }
    return undefined
}

export function buildHeightPrepass(
    settings: Settings,
    startingPosition: CFrame,
    rayVector: Vector3,
    rayLength: number,
    imageDimensions: Vector2,
    blockcast: Blockcaster = workspaceBlockcast
): HeightPrepassGrid {
    const rayUnit = rayVector.Unit
    const cellWorldSize = HEIGHT_PREPASS_CELL_WORLD_SIZE
    const cellPixelSize = cellWorldSize / settings.resolution
    const cellsX = math.ceil(imageDimensions.X / cellPixelSize)
    const cellsZ = math.ceil(imageDimensions.Y / cellPixelSize)
    const boxFootprint = cellWorldSize * HEIGHT_PREPASS_FOOTPRINT_OVERLAP
    const margin = cellWorldSize

    const params = new RaycastParams()
    params.FilterType = Enum.RaycastFilterType.Exclude
    const boxSize = new Vector3(
        boxFootprint,
        HEIGHT_PREPASS_BOX_THICKNESS,
        boxFootprint
    )

    const shifts: number[] = []
    let cellsChecked = 0
    let cellsMissed = 0
    let yieldTime = tick()
    for (let cz = 0; cz < cellsZ; cz++) {
        for (let cx = 0; cx < cellsX; cx++) {
            const prepassIsUnproductive =
                cellsChecked >= HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL &&
                cellsMissed / cellsChecked >= HEIGHT_PREPASS_BAIL_MISS_RATIO
            if (prepassIsUnproductive) {
                shifts.push(0)
                continue
            }
            yieldTime = delayForScriptExhuastion(yieldTime)
            const pixelCenterX = (cx + 0.5) * cellPixelSize
            const pixelCenterZ = (cz + 0.5) * cellPixelSize
            const cellTopCFrame = startingPosition.mul(
                new CFrame(
                    pixelCenterX * settings.resolution,
                    0,
                    pixelCenterZ * settings.resolution
                )
            )
            const hit = chainedBlockcast(
                cellTopCFrame,
                boxSize,
                rayVector,
                params,
                blockcast
            )
            cellsChecked++
            if (!hit) {
                cellsMissed++
                shifts.push(0)
                continue
            }
            const distanceFromTop = hit.Position.sub(
                cellTopCFrame.Position
            ).Dot(rayUnit)
            shifts.push(math.clamp(distanceFromTop - margin, 0, rayLength))
        }
    }

    return { cellPixelSize, cellsX, cellsZ, shifts }
}
