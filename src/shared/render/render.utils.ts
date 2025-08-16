import { Settings, StructureGrouping } from "shared/settings/settings.model"
import {
    ActorHelperRequest,
    Pixel,
    RenderConstants,
    ReplacementRayCastFunc,
    SurfaceOptions
} from "./render.model"
import { color3ToVector3 } from "shared/utils"
import { getEditableImage, getEditableMesh } from "./editable-cache"
import { render } from "./render.main"

const LIGHTING = game.GetService("Lighting")
const TERRAIN = game.Workspace.Terrain

const DELAY_TIME = 3

const SUN_POSITION = LIGHTING.GetSunDirection()
const MAX_SURFACE_APPEREANCE_RECASTS = 10

const rand = new Random()

const castParams = new RaycastParams()
castParams.FilterType = Enum.RaycastFilterType.Exclude
castParams.FilterDescendantsInstances = []

export function computePixel(
    position: Vector2,
    settings: Settings,
    renderConstants: RenderConstants,
    isParallel: boolean
): Pixel | "texture" | undefined {
    const xOffset = position.X * settings.resolution
    const zOffset = position.Y * settings.resolution

    const rayCFrame = renderConstants.startingPosition.mul(
        new CFrame(xOffset, 0, zOffset)
    )
    const rayCenter = rayCFrame.Position
    const results: RaycastResult[] = []

    let waterHeight = 0 // Default to no water
    const rayBottom =
        renderConstants.startingPosition.Y - renderConstants.rayLength

    // Helper function to compute height
    const calculateHeight = (y: number) => {
        const adjustment = rayBottom * -1
        const adjustedY = y + adjustment
        const adjustedTop = renderConstants.startingPosition.Y + adjustment
        return math.floor((adjustedY / adjustedTop) * 255)
    }

    // Helper function to deal deal with textured parts
    const bailTextureCalulations = (hit: RaycastResult): boolean => {
        if (isParallel) {
            const isMesh = hit.Instance.IsA("MeshPart")
            if (isMesh) {
                const meshHasTexture =
                    !!hit.Instance.TextureID ||
                    !!hit.Instance.FindFirstChildOfClass("SurfaceAppearance")
                return meshHasTexture
            }
        }
        return false
    }

    // Initial raycast
    let primary = castRay(rayCenter, renderConstants.rayVector)
    if (!primary) return
    if (bailTextureCalulations(primary)) {
        return "texture"
    }

    // Handle water material
    if (checkIfRayIsWater(primary, settings)) {
        waterHeight = calculateHeight(primary.Position.Y)
        primary = castRay(rayCenter, renderConstants.rayVector, true)
        if (!primary) {
            const castFromBottom = game.Workspace.Raycast(
                rayCenter.sub(settings.mapScale.mul(new Vector3(0, 1, 0))),
                renderConstants.rayVector.mul(-1),
                castParams
            )
            if (castFromBottom) {
                waterHeight = calculateHeight(castFromBottom.Position.Y)
            }
            return {
                r: 0,
                g: 0,
                b: 0,
                h: 0,
                material: 0,
                road: 0,
                building: 0,
                water: waterHeight
            }
        }
    }

    results.push(primary)

    // Collect additional samples
    for (let i = 1; i < settings.samples; i++) {
        const samplePosition = getSamplePosition(rayCFrame, settings.resolution)
        const result = castRay(samplePosition, renderConstants.rayVector, true)
        if (result) {
            results.push(result)
            if (bailTextureCalulations(result)) {
                return "texture"
            }
        }
    }

    // Handle terrain hit
    const terrainHit =
        getTerrainHit(
            primary,
            rayCenter,
            renderConstants.rayVector,
            settings.terrain
        ) || primary

    // Compute color
    let color = averageColorSamples(results, renderConstants.rayVector)
    color = averageShadeSamples(results, color, settings)
    color = gammaNormalizeSamples(color)
    if (settings.shadows.enabled) {
        color = applyShadowsSamples(results, color, settings)
    }

    // Determine groupings
    const buildingGrouping = findGrouping(
        settings.buildingGroups,
        primary,
        true
    )
    const roadGrouping = findGrouping(settings.roadGroups, primary, false)

    // Validate material map
    if (!renderConstants.materialMap.get(primary.Material)) {
        warn(
            renderConstants.materialMap,
            primary.Material,
            renderConstants.materialMap.get(primary.Material)
        )
    }

    return {
        r: math.floor(color.X * 255),
        g: math.floor(color.Y * 255),
        b: math.floor(color.Z * 255),
        h: calculateHeight(terrainHit.Position.Y),
        material: renderConstants.materialMap.get(primary.Material) || 0,
        road: roadGrouping,
        building: buildingGrouping,
        water: waterHeight
    }
}

function checkIfRayIsWater(result: RaycastResult, settings: Settings): boolean {
    const group = settings.water

    // Check instance hierarchy
    if (group.instances) {
        for (const item of group.instances) {
            if (result.Instance.IsDescendantOf(item)) return true
        }
    }

    // Check materials
    if (group.materials) {
        const isMaterialMatch = group.materials.includes(result.Material)
        const isTerrainMatch = group.onlyTerrain
            ? result.Instance.ClassName === "Terrain"
            : true

        if (isMaterialMatch && isTerrainMatch) {
            return true
        }
    }
    return false
}

// Helper function to find groupings (buildings, roads, etc.)
function findGrouping(
    groups: StructureGrouping[],
    primary: RaycastResult,
    allowNonTerrain: boolean
): number {
    for (let i = 0; i < groups.size(); i++) {
        const group = groups[i]

        // Check instance hierarchy
        if (group.instances) {
            for (const item of group.instances) {
                if (primary.Instance.IsDescendantOf(item)) return i + 1
            }
        }

        // Check materials
        if (group.materials) {
            const isMaterialMatch = group.materials.includes(primary.Material)
            const isTerrainMatch = group.onlyTerrain
                ? primary.Instance.ClassName === "Terrain"
                : true

            if (isMaterialMatch && (allowNonTerrain || isTerrainMatch)) {
                return i + 1
            }
        }
    }
    return 0
}

function applyShadowsSamples(
    samples: RaycastResult[],
    color: Vector3,
    settings: Settings
): Vector3 {
    const occludedSamples = samples.reduce(
        (acc, sample) => (checkSunShadow(sample, settings) ? acc + 1 : acc),
        0
    )

    const shadowDarkness =
        (occludedSamples / samples.size()) * settings.shadows.darkness
    return color.mul(1 - shadowDarkness)
}

function getSamplePosition(rayCenter: CFrame, resolution: number): Vector3 {
    const randomOffset = new CFrame(
        (rand.NextNumber() - 0.5) * resolution,
        0,
        (rand.NextNumber() - 0.5) * resolution
    )
    return randomOffset.mul(rayCenter).Position
}

function castRay(
    rayPosition: Vector3,
    rayVector: Vector3,
    ignoreWater: boolean = false,
    rayParams: RaycastParams = castParams,
    includeMode = false
): RaycastResult | undefined {
    rayParams.IgnoreWater = ignoreWater
    const results = game.Workspace.Raycast(rayPosition, rayVector, rayParams)
    if (!results) return results
    if (includeMode) return results
    if (results.Instance.Transparency < 1) return results
    rayParams.AddToFilter(results.Instance)
    return castRay(rayPosition, rayVector, ignoreWater, rayParams)
}

function checkSunShadow(hit: RaycastResult, settings: Settings): boolean {
    let direction = settings.shadows.sunDirection // Multiple samples at different positions act as shadow sample offsettings
    const occluded = castRay(hit.Position, direction.mul(3000))
    return !!occluded
}

function getTerrainHit(
    RaycastResult: RaycastResult,
    rayPosition: Vector3,
    rayVector: Vector3,
    terrain: Instance[] = [game.Workspace.Terrain]
): RaycastResult | undefined {
    const terrainWasHit = terrain.some(
        (terrainObj: Instance) =>
            terrainObj === RaycastResult.Instance ||
            RaycastResult.Instance.IsDescendantOf(terrainObj)
    )
    if (terrainWasHit) {
        return RaycastResult
    }
    const params = new RaycastParams()
    params.FilterType = Enum.RaycastFilterType.Include
    params.AddToFilter(terrain)

    const result = castRay(rayPosition, rayVector, true, params, true)
    return result
}

function getColorFromMesh(
    result: RaycastResult,
    downVector: Vector3,
    replaceRaycastResult: ReplacementRayCastFunc
): Vector3 {
    try {
        const instance = result.Instance as MeshPart
        const surfaceAppearance =
            result.Instance.FindFirstChildWhichIsA("SurfaceAppearance")

        const surfaceAppearanceHasTexture =
            surfaceAppearance && surfaceAppearance.ColorMap

        const noTextureFound =
            !surfaceAppearanceHasTexture && !instance.TextureID
        if (noTextureFound) {
            return color3ToVector3(result.Instance.Color)
        }

        if (!surfaceAppearance) {
            // Handles case where no texture is found
            return getSimpleTextureFromMesh(
                result,
                instance.TextureID,
                downVector
            )
        }

        const surfaceAppearanceUsesOverlay =
            surfaceAppearance.ColorMap &&
            surfaceAppearance.AlphaMode === Enum.AlphaMode.Overlay
        if (surfaceAppearanceUsesOverlay) {
            return getOverlayTextureFromMesh(
                result,
                surfaceAppearance,
                downVector
            )
        }

        const surfaceAppearanceUsesAlphaBlend =
            surfaceAppearance.ColorMap &&
            surfaceAppearance.AlphaMode === Enum.AlphaMode.Transparency
        if (surfaceAppearanceUsesAlphaBlend) {
            return getSurfaceOpacityTextureFromMesh(
                result,
                surfaceAppearance,
                downVector,
                replaceRaycastResult
            )
        }
    } catch (e) {
        warn(e)
    }

    return color3ToVector3(result.Instance.Color)
}

function getSurfaceOpacityTextureFromMesh(
    originalResult: RaycastResult,
    surfaceAppearance: SurfaceAppearance,
    downVector: Vector3,
    replaceRaycastResult: ReplacementRayCastFunc
): Vector3 {
    const editableMesh = getEditableMesh(
        (originalResult.Instance as MeshPart).MeshId
    )
    const editableImage = getEditableImage(surfaceAppearance.ColorMap)
    const recastParams = new RaycastParams()
    recastParams.FilterType = Enum.RaycastFilterType.Include
    recastParams.AddToFilter(originalResult.Instance)

    const underlyingParams = new RaycastParams()
    underlyingParams.FilterType = Enum.RaycastFilterType.Exclude
    underlyingParams.AddToFilter(originalResult.Instance)
    underlyingParams.IgnoreWater = true

    const underlyingInstance = castRay(
        originalResult.Position,
        downVector,
        true,
        underlyingParams
    )
    const underlyingColor = getColorFromResult(
        underlyingInstance,
        downVector,
        replaceRaycastResult
    )
    const replaceResultWithUnderlyingInstance = () => {
        if (underlyingInstance) {
            replaceRaycastResult(originalResult, underlyingInstance)
        }
    }

    const getColorFromTransparency = (
        result: RaycastResult,
        attempts: number = 0
    ): Vector3 => {
        if (attempts > MAX_SURFACE_APPEREANCE_RECASTS) {
            replaceResultWithUnderlyingInstance()
            replaceRaycastResult(originalResult, result)
            return underlyingColor
        }
        const relativePoint = getRelativePointOnMesh(result)
        const [color, opacity] = getColorFromPoint(
            editableMesh,
            editableImage,
            relativePoint,
            downVector,
            {
                color: surfaceAppearance.Color,
                normalMap: surfaceAppearance.NormalMap,
                metalnessMap: surfaceAppearance.MetalnessMap,
                roughnessMap: surfaceAppearance.RoughnessMap
            }
        )
        if (opacity > 0) {
            replaceRaycastResult(originalResult, result)
            return color3ToVector3(color)
        }

        const recast = castRay(
            result.Position.add(downVector.Unit.mul(0.2)),
            downVector,
            true,
            recastParams
        )
        if (!recast) {
            replaceResultWithUnderlyingInstance()
            return underlyingColor
        } else {
            return getColorFromTransparency(recast, attempts + 1)
        }
    }
    return getColorFromTransparency(originalResult)
}

function getRelativePointOnMesh(result: RaycastResult): Vector3 {
    const scale = (result.Instance as MeshPart).MeshSize.div(
        result.Instance.Size
    )
    const relativePoint = result.Instance.CFrame.PointToObjectSpace(
        result.Position
    ).mul(scale)

    return relativePoint
}

function getOverlayTextureFromMesh(
    result: RaycastResult,
    surfaceAppearance: SurfaceAppearance,
    downVector: Vector3
): Vector3 {
    try {
        const editableMesh = getEditableMesh(
            (result.Instance as MeshPart).MeshId
        )
        const editableImage = getEditableImage(surfaceAppearance.ColorMap)

        const scale = (result.Instance as MeshPart).MeshSize.div(
            result.Instance.Size
        )
        const relativePoint = result.Instance.CFrame.PointToObjectSpace(
            result.Position
        ).mul(scale)

        const [color, opacity] = getColorFromPoint(
            editableMesh,
            editableImage,
            relativePoint,
            downVector
        )

        return color3ToVector3(
            overlayBlend(color, surfaceAppearance.Color, opacity)
        )
    } catch (e) {
        return color3ToVector3(result.Instance.Color)
    }
}

function overlayBlend(base: Color3, overlay: Color3, opacity: number): Color3 {
    const blendChannel = (cb: number, co: number): number => {
        return cb <= 0.5 ? 2 * cb * co : 1 - 2 * (1 - cb) * (1 - co)
    }

    const r = blendChannel(base.R, overlay.R)
    const g = blendChannel(base.G, overlay.G)
    const b = blendChannel(base.B, overlay.B)

    return new Color3(
        base.R * (1 - opacity) + r * opacity,
        base.G * (1 - opacity) + g * opacity,
        base.B * (1 - opacity) + b * opacity
    )
}

function getSimpleTextureFromMesh(
    result: RaycastResult,
    imageId: string,
    downVector: Vector3
) {
    try {
        const editableMesh = getEditableMesh(
            (result.Instance as MeshPart).MeshId
        )
        const editableImage = getEditableImage(imageId)

        const scale = (result.Instance as MeshPart).MeshSize.div(
            result.Instance.Size
        )
        const relativePoint = result.Instance.CFrame.PointToObjectSpace(
            result.Position
        ).mul(scale)

        const [color] = getColorFromPoint(
            editableMesh,
            editableImage,
            relativePoint,
            downVector
        )

        return color3ToVector3(color)
    } catch (e) {
        return color3ToVector3(result.Instance.Color)
    }
}

function getColorFromPoint(
    mesh: EditableMesh,
    image: EditableImage,
    position: Vector3,
    downVector: Vector3,
    surfaceOptions: SurfaceOptions = {}
): [Color3, number] {
    let faceId: number
    let baryCoordinates: Vector3
    let _surfacePoint: Vector3

    if (!surfaceOptions.color) {
        ;[faceId, _surfacePoint, baryCoordinates] =
            mesh.FindClosestPointOnSurface(
                position.add(downVector.Unit.mul(-0.1))
            )
    } else {
        ;[faceId, _surfacePoint, baryCoordinates] = mesh.RaycastLocal(
            position.add(downVector.Unit.mul(-0.1)),
            downVector.Unit.mul(0.2)
        )
    }

    if (!faceId) {
        return [new Color3(0, 0, 0), 0]
    }

    const uvs: number[] = mesh.GetFaceUVs(faceId) as number[]
    const uvCoordinates = uvs.map((x) => mesh.GetUV(x) as Vector2)

    const u =
        baryCoordinates.X * uvCoordinates[0]?.X +
        baryCoordinates.Y * uvCoordinates[1]?.X +
        baryCoordinates.Z * uvCoordinates[2]?.X

    const v =
        baryCoordinates.X * uvCoordinates[0]?.Y +
        baryCoordinates.Y * uvCoordinates[1]?.Y +
        baryCoordinates.Z * uvCoordinates[2]?.Y

    let samplePoint = new Vector2(
        math.floor(u * image.Size.X),
        math.floor(v * image.Size.Y)
    )
    samplePoint = new Vector2(
        math.max(0, math.min(samplePoint.X, image.Size.X - 1)),
        math.max(0, math.min(samplePoint.Y, image.Size.Y - 1))
    )

    const colorBuf = image.ReadPixelsBuffer(samplePoint, new Vector2(1, 1))

    let color = Color3.fromRGB(
        buffer.readu8(colorBuf, 0),
        buffer.readu8(colorBuf, 1),
        buffer.readu8(colorBuf, 2)
    )
    const opacity = buffer.readu8(colorBuf, 3) / 255

    if (surfaceOptions.color) {
        color = new Color3(
            color.R * surfaceOptions.color.R,
            color.G * surfaceOptions.color.G,
            color.B * surfaceOptions.color.B
        )
    }
    return [color, opacity]
}

function getColorFromResult(
    result: RaycastResult | undefined,
    downVector: Vector3,
    replaceRaycastResult: ReplacementRayCastFunc
): Vector3 {
    if (!result) {
        return new Vector3(0, 0, 0)
    }
    if (result.Instance !== game.Workspace.Terrain) {
        if (result.Instance.IsA("MeshPart")) {
            return getColorFromMesh(result, downVector, replaceRaycastResult)
        } else {
            return color3ToVector3(result.Instance.Color)
        }
    }
    if (result.Material === Enum.Material.Water) {
        return color3ToVector3(TERRAIN.WaterColor)
    }
    return color3ToVector3(TERRAIN.GetMaterialColor(result.Material))
}

function srgbToLinear(color: number): number {
    if (color <= 0.04045) {
        return color / 12.92
    } else {
        return math.pow((color + 0.055) / 1.055, 2.4)
    }
}

function linearToSrgb(color: number): number {
    if (color <= 0.0031308) {
        return color * 12.92
    } else {
        return 1.055 * math.pow(color, 1 / 2.4) - 0.055
    }
}

function convertVector3SrgbToLinear(vector: Vector3): Vector3 {
    return new Vector3(
        srgbToLinear(vector.X),
        srgbToLinear(vector.Y),
        srgbToLinear(vector.Z)
    )
}

function convertVector3LinearToSrgb(vector: Vector3): Vector3 {
    return new Vector3(
        linearToSrgb(vector.X),
        linearToSrgb(vector.Y),
        linearToSrgb(vector.Z)
    )
}

function averageColorSamples(
    rayCastResults: RaycastResult[],
    downVector: Vector3
): Vector3 {
    let color = new Vector3(0, 0, 0)
    const replaceResultSample: ReplacementRayCastFunc = (
        originalResult: RaycastResult,
        replacement: RaycastResult
    ) => {
        const index = rayCastResults.findIndex((x) => originalResult === x)
        rayCastResults[index] = replacement
    }

    for (const result of rayCastResults) {
        const sampleColor = getColorFromResult(
            result,
            downVector,
            replaceResultSample
        ) // Await works here
        color = color.add(convertVector3SrgbToLinear(sampleColor))
    }
    return convertVector3LinearToSrgb(color.div(rayCastResults.size()))
}

function gammaNormalizeSamples(samples: Vector3): Vector3 {
    const gammeNormalize = 1.1
    return new Vector3(
        samples.X ** gammeNormalize,
        samples.Y ** gammeNormalize,
        samples.Z ** gammeNormalize
    )
}

function showDebugRayPosition(position: Vector3): Part {
    const part = new Instance("Part")
    part.Anchored = true
    part.CFrame = new CFrame(position)
    part.Color = new Color3(1, 0, 0)
    part.Size = new Vector3(1, 1, 1)
    part.Parent = game.Workspace.Terrain

    return part
}

function averageShadeSamples(
    rayCastResults: RaycastResult[],
    inputColor: Vector3,
    settings: Settings
): Vector3 {
    let color = new Vector3(0, 0, 0)
    rayCastResults.forEach((result: RaycastResult) => {
        color = color.add(
            convertVector3SrgbToLinear(shadeColor(inputColor, result, settings))
        )
    })
    return convertVector3LinearToSrgb(color.div(rayCastResults.size()))
}

function shadeColor(
    color: Vector3,
    result: RaycastResult,
    settings: Settings
): Vector3 {
    const recievedIlluminance = math.max(
        result.Normal.Dot(settings.shadows.sunDirection),
        0.3
    )
    return color.mul(0.2 + recievedIlluminance * 0.8)
}

export function delayForScriptExhuastion(
    startTime: number,
    delayTime: number = DELAY_TIME
): number {
    if (tick() - startTime > delayTime) {
        task.wait(0.1)
        return tick()
    } else {
        return startTime
    }
}
