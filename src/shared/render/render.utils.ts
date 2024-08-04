import { Settings } from 'shared/settings/settings.model'
import { Pixel, RenderConstants } from './render.model'
import { color3ToVector3 } from 'shared/utils'

const LIGHTING = game.GetService('Lighting')
const TERRAIN = game.Workspace.Terrain

const DELAY_TIME = 5

const SUN_POSITION = LIGHTING.GetSunDirection()

const materials = Enum.Material.GetEnumItems()
const materialMap = new Map<Enum.Material, number>()
materials.forEach((material: Enum.Material, index: number) => {
    materialMap.set(material, index)
})

const MAP_STRUCTURES = game.Workspace.FindFirstChild("Structures")

export function computePixel(
    position: Vector2,
    settings: Settings,
    renderConstants: RenderConstants,
): Pixel | undefined {
    const xPos = renderConstants.xSpacing * position.X + settings.corners.topRight.X
    const zPos = renderConstants.ySpacing * position.Y + settings.corners.topRight.Z

    const rayCenter = new Vector3(xPos, settings.corners.topRight.Y, zPos)
    const result = castRay(rayCenter, renderConstants.rayVector)

    if (!result) {
        return
    }
    // showDebugRayPosition(rayCenter)

    let color = getColorFromResult(result)
    color = shadeColor(color, result)

    const height = math.floor((result.Position.Y - renderConstants.rayBottom) / renderConstants.normalizedRayTop * 255)

    const isStructure = MAP_STRUCTURES && result.Instance.IsDescendantOf(MAP_STRUCTURES)

    return {
        r: math.floor(color.X * 255),
        g: math.floor(color.Y * 255),
        b: math.floor(color.Z * 255),
        h: height,
        material: materialMap.get(result.Material) || 0,
        road: result.Material === Enum.Material.Cobblestone ? 1 : 0,
        building: isStructure ? 1 : 0,
        water: result.Material === Enum.Material.Water ? 1 : 0,
    }
}

function castRay(rayPosition: Vector3, rayVector: Vector3): RaycastResult | undefined {
    return game.Workspace.Raycast(rayPosition, rayVector)
}

function getColorFromResult(result: RaycastResult): Vector3 {
    if (result.Instance !== game.Workspace.Terrain) {
        return color3ToVector3(result.Instance.Color)
    }
    if (result.Material === Enum.Material.Water) {
        return color3ToVector3(TERRAIN.WaterColor)
    }
    return color3ToVector3(TERRAIN.GetMaterialColor(result.Material))
}

function showDebugRayPosition(position: Vector3) {
    const part = new Instance('Part')
    part.Anchored = true
    part.CFrame = new CFrame(position)
    part.Color = new Color3(1, 0, 0)
    part.Size = new Vector3(1, 1, 1)
    part.Parent = game.Workspace
} 

function shadeColor(color: Vector3, result: RaycastResult): Vector3 {
    const recievedIlluminance = math.max(result.Normal.Dot(SUN_POSITION), 0)
    return color.mul(0.2 + recievedIlluminance * 0.8)
}

export function delayForScriptExhuastion(startTime: number, delayTime: number = DELAY_TIME): number {
    if (tick() - startTime > delayTime) {
        task.wait(0.1)
        return tick()
    } else {
        return startTime
    }
}
