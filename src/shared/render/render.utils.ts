import { Settings } from 'shared/settings/settings.model'
import { Pixel, RenderConstants } from './render.model'
import { color3ToVector3 } from 'shared/utils'

const LIGHTING = game.GetService('Lighting')
const TERRAIN = game.Workspace.Terrain

const SUN_POSITION = LIGHTING.GetSunDirection()

const materials = Enum.Material.GetEnumItems()
const materialMap = new Map<Enum.Material, number>()
materials.forEach((material: Enum.Material, index: number) => {
    materialMap.set(material, index)
})

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

    let color = getColorFromResult(result)
    color = shadeColor(color, result)

    const height =
        (result.Position.Y - renderConstants.rayLength) / (settings.corners.topRight.Y - renderConstants.rayLength)

    return {
        r: color.X,
        g: color.Y,
        b: color.Z,
        h: height * 255,
        material: materialMap.get(result.Material) || 0,
        road: 0,
        building: 0,
        water: 0,
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

function shadeColor(color: Vector3, result: RaycastResult): Vector3 {
    const recievedIlluminance = math.max(result.Normal.Dot(SUN_POSITION), 0)
    return color.mul(0.2 + recievedIlluminance * 0.8)
}
