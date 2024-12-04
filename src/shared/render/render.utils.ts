import { Settings } from 'shared/settings/settings.model'
import { Pixel, RenderConstants } from './render.model'
import { color3ToVector3 } from 'shared/utils'
import { render } from './render.main'

const LIGHTING = game.GetService('Lighting')
const TERRAIN = game.Workspace.Terrain

const DELAY_TIME = 3 

const SUN_POSITION = LIGHTING.GetSunDirection()

const rand = new Random()


const castParams = new RaycastParams()
castParams.FilterType = Enum.RaycastFilterType.Exclude
castParams.FilterDescendantsInstances = []

const MAP_STRUCTURES = game.Workspace.FindFirstChild("Structures")

export function computePixel(
    position: Vector2,
    settings: Settings,
    renderConstants: RenderConstants,
): Pixel | undefined {
    const xPos = renderConstants.xSpacing * position.X + settings.corners.topRight.X
    const zPos = renderConstants.ySpacing * position.Y + settings.corners.topRight.Z

    const rayCenter = new Vector3(xPos, settings.corners.topRight.Y, zPos)
    const results: RaycastResult[] = []
    const shadowSamples: Vector3[] = []

    let waterHeight = 0 //Water height of 0 assumes there is no water
    
    let primary = castRay(rayCenter, renderConstants.rayVector)
    if (!primary) {
        return
    }
    if (primary.Material === Enum.Material.Water) {
        waterHeight = math.max(1,
            math.floor((primary.Position.Y - renderConstants.rayBottom) / renderConstants.normalizedRayTop * 255)
        )
        primary = castRay(rayCenter, renderConstants.rayVector, true)

        if (!primary) {
            // showDebugRayPosition(rayCenter.add(renderConstants.rayVector))
            return
        }
    }

    results.push(primary)

    for (let i = 1; i < settings.samples; i++) {
        const samplePosition = getSamplePosition(rayCenter, renderConstants)
        const result = castRay(samplePosition, renderConstants.rayVector, true)
        // showDebugRayPosition(samplePosition)
        if (result) {
            results.push(result)
        }
    }

    const terrainHit = getTerrainHit(primary,rayCenter, renderConstants.rayVector, new RaycastParams()) || primary

    let color = averageColorSamples(results)
    color = averageShadeSamples(results, color)
    color = gammaNormalizeSamples(color)

    const height = math.floor((terrainHit.Position.Y - renderConstants.rayBottom) / renderConstants.normalizedRayTop * 255)

    const isStructure = MAP_STRUCTURES && primary.Instance.IsDescendantOf(MAP_STRUCTURES)

    if (!renderConstants.materialMap.get(primary.Material)) {
        print(renderConstants.materialMap, primary.Material, renderConstants.materialMap.get(primary.Material))
    }

    return {
        r: math.floor(color.X * 255),
        g: math.floor(color.Y * 255),
        b: math.floor(color.Z * 255),
        h: height,
        material: renderConstants.materialMap.get(primary.Material) || 0,
        road: isRoad(primary.Material) ? 1 : 0,
        building: isStructure ? 1 : 0,
        water: waterHeight
    }
}

function getSamplePosition(rayCenter: Vector3, renderConstants: RenderConstants): Vector3 {
    const randomOffset = new Vector3(
        rand.NextNumber() * renderConstants.xSpacing - renderConstants.xSpacing / 2,
        0,
        rand.NextNumber() * renderConstants.ySpacing - renderConstants.ySpacing / 2
    )
    return randomOffset.add(rayCenter)
}


function isRoad(material: Enum.Material): boolean {
    switch (material) {
        case Enum.Material.Cobblestone:
        case Enum.Material.Mud:
            return true
        
    }
    return material === Enum.Material.Cobblestone
}

function castRay(rayPosition: Vector3, rayVector: Vector3, ignoreWater: boolean = false, rayParams: RaycastParams = castParams): RaycastResult | undefined {
    rayParams.IgnoreWater = ignoreWater
    return game.Workspace.Raycast(rayPosition, rayVector, rayParams)
}

function findHighestAncestorThatDoesNotShareParent(instance: Instance, terrain: Instance[]): Instance | undefined {
    if (terrain.some(terrainItem => instance.Parent && instance.Parent.IsAncestorOf(terrainItem))) {
        return instance
    }
    if (instance.Parent) {
        return findHighestAncestorThatDoesNotShareParent(instance.Parent, terrain)
    }
    return undefined
}

function getTerrainHit(RaycastResult: RaycastResult, rayPosition: Vector3, rayVector: Vector3, castParams: RaycastParams, terrain: Instance[] = [game.Workspace.Terrain]):  RaycastResult | undefined {
    if (terrain.find((terrain: Instance) => RaycastResult.Instance === terrain)) {
        return RaycastResult
    }
    const result = castRay(rayPosition, rayVector, true, castParams)
    if (result) {
        const highestNonCommonAncestor = findHighestAncestorThatDoesNotShareParent(result.Instance, terrain)
        if (!highestNonCommonAncestor) {
            return 
        }
        castParams.AddToFilter(highestNonCommonAncestor)
        castParams.FilterType = Enum.RaycastFilterType.Exclude
        return getTerrainHit(result, rayPosition, rayVector, castParams, terrain)
    }
    return 
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

function srgbToLinear(color: number): number {
    if (color <= 0.04045) {
        return color / 12.92;
    } else {
        return math.pow((color + 0.055) / 1.055, 2.4);
    }
}

function linearToSrgb(color: number): number {
    if (color <= 0.0031308) {
        return color * 12.92;
    } else {
        return 1.055 * math.pow(color, 1 / 2.4) - 0.055;
    }
}

function convertVector3SrgbToLinear(vector: Vector3): Vector3 {
    return new Vector3(srgbToLinear(vector.X), srgbToLinear(vector.Y), srgbToLinear(vector.Z))
}

function convertVector3LinearToSrgb(vector: Vector3): Vector3 {
    return new Vector3(linearToSrgb(vector.X), linearToSrgb(vector.Y), linearToSrgb(vector.Z))
}

function averageColorSamples(rayCastResults: RaycastResult[]): Vector3 {
    let color = new Vector3(0, 0, 0)
    rayCastResults.forEach((result: RaycastResult) => {
        color = color.add(convertVector3SrgbToLinear(getColorFromResult(result)))
    })
    return convertVector3LinearToSrgb(color.div(rayCastResults.size()))
}

function gammaNormalizeSamples(samples: Vector3): Vector3 {
    const gammeNormalize = 1.1
    return new Vector3(samples.X ** gammeNormalize, samples.Y ** gammeNormalize, samples.Z ** gammeNormalize)
}

function showDebugRayPosition(position: Vector3) {
    const part = new Instance('Part')
    part.Anchored = true
    part.CFrame = new CFrame(position)
    part.Color = new Color3(1, 0, 0)
    part.Size = new Vector3(1, 1, 1)
    part.Parent = game.Workspace
} 

function averageShadeSamples(rayCastResults: RaycastResult[], inputColor: Vector3): Vector3 {
    let color = new Vector3(0, 0, 0)
    rayCastResults.forEach((result: RaycastResult) => {
        color = color.add(convertVector3SrgbToLinear(shadeColor(inputColor,result)))
    })
    return convertVector3LinearToSrgb(color.div(rayCastResults.size()))
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
