import { Pixel } from "./render.model";
import { Settings } from "./settings.model";
import { color3ToVector3 } from "./utils";

const LIGHTING = game.GetService("Lighting");
const TERRAIN = game.Workspace.Terrain

const SUN_POSITION = LIGHTING.GetSunDirection()

export function computePixel(pos: Vector3, settings: Settings, rayLength: number): Pixel {
    let masterColor = new Vector3()
    let height = 0
    for ( let i = 0; i < settings.samples; i++) {
        const rayVector = new Vector3(0, -1, 0).mul(rayLength)
        const samplePos = pos.add(new Vector3(
            pos.X + (math.random() * 2 - .5),
            pos.Y,
            pos.Z + math.random() * 2 - .5
        ))


        const result = castRay(samplePos, rayVector)

        // const part = new Instance("Part")
        // part.Anchored = true
        // part.CFrame = new CFrame(samplePos)
        // part.Color = new Color3(1, 0, 0)
        // part.Size = new Vector3(1, 1, 1)
        // part.Parent = TERRAIN
        // part.CanCollide = false
        // if (!result) {
        //
        //     const p2  = part.Clone()
        //     p2.CFrame = new CFrame(samplePos.add(rayVector))
        //     p2.Parent = part
        //
        // }
        // else {
        //
        //     const p2  = part.Clone()
        //     p2.CFrame = new CFrame(result.Position)
        //     p2.Parent = part
        // }
        if (!result){
            return { r: 255, g: 0, b: 0, h: 0 }
        }
        let color = getColorFromResult(result)
        color = shadeColor(color, result)

        masterColor = masterColor.add(color)
        height += (result.Position.Y - settings.corners.bottomLeft.Y) / rayLength
    }


    masterColor = returnColorAverage(masterColor, settings.samples)

    return {
        r: math.floor(masterColor.X * 255),
        g: math.floor(masterColor.Y * 255),
        b: math.floor(masterColor.Z * 255),
        h: (height / settings.samples) * 255
    }
}

function returnColorAverage(color: Vector3, samples: number): Vector3 {
    return color.mul(1 / samples)
}

function castRay(rayPosition: Vector3, rayVector: Vector3): RaycastResult | undefined{
    return game.Workspace.Raycast(rayPosition, rayVector)
}

function getColorFromResult(result: RaycastResult): Vector3 {
    if (result.Instance !== game.Workspace.Terrain){
        return color3ToVector3(result.Instance.Color) 
    }
    if (result.Material === Enum.Material.Water) {
        return color3ToVector3(TERRAIN.WaterColor)
    }
    return color3ToVector3(TERRAIN.GetMaterialColor(result.Material))
}

function shadeColor(color: Vector3, result: RaycastResult): Vector3 {
    const recievedIlluminance = math.max(result.Normal.Dot(SUN_POSITION),0)
    return color.mul(.2 + recievedIlluminance *.8)
}

