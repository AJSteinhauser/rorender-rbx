import { Pixel } from "./render.model";
import { Settings } from "./settings.model";
import { convertImageToString, getImageDimensions, splitImageIntoChunks } from "./utils";
const httpService = game.GetService("HttpService");

const partTemplate = new Instance("Part")
partTemplate.Size = new Vector3(1, 1, 1)
partTemplate.CanCollide = false
partTemplate.Color = Color3.fromRGB(255, 0, 0)
partTemplate.Anchored = true

export function render(settings: Settings): void {
    const imageDimensions = getImageDimensions(settings)
    const rayLength = math.abs(settings.corners.topRight.Y - settings.corners.bottomLeft.Y)
    print(rayLength)
    const rayVector = new Vector3(0, -1, 0).mul(rayLength);

    const image = new Array<Pixel>(imageDimensions.X * imageDimensions.Y);

    print(imageDimensions)

    const xSpacing = math.abs(settings.corners.bottomLeft.X - settings.corners.topRight.X) / imageDimensions.X
    const ySpacing = math.abs(settings.corners.bottomLeft.Z - settings.corners.topRight.Z) / imageDimensions.Y

    let startTime = tick()
    
    for (let y = 0; y < imageDimensions.Y; y++) {
        for (let x = 0; x < imageDimensions.X; x++) {
            if (tick() - startTime > 5) {
                task.wait(.1)
                startTime = tick()
            }
            const rayPosition = new Vector3(
                settings.corners.topRight.X + xSpacing * x,
                settings.corners.topRight.Y,
                settings.corners.topRight.Z + ySpacing * y
            )
            // const clone = partTemplate.Clone() 
            // clone.CFrame = new CFrame(rayPosition)
            // clone.Parent = game.Workspace.Terrain

            const result = game.Workspace.Raycast(rayPosition, rayVector)
            let pixel: Pixel = { r: 0, g: 0, b: 0, h: 0 }
            if (result) {
                let color = result.Instance.Color
                if (result.Instance === game.Workspace.Terrain && result.Material !== Enum.Material.Water){
                    color = game.Workspace.Terrain.GetMaterialColor(result.Material)
                }
                const normalizedHeight = (result.Position.Y - settings.corners.bottomLeft.Y) / rayLength
                pixel = {
                    r: math.floor(color.R * 255),
                    g: math.floor(color.G * 255),
                    b: math.floor(color.B * 255),
                    h: math.floor(normalizedHeight * 255)
                }
            }
            image.push(pixel)
        }
    }

    const imageString = convertImageToString(image, imageDimensions)
    // const imageString = 'abcdefghijklmnopqrstuvwxyz'
    const imageChunks = splitImageIntoChunks(imageString)
    print(imageChunks.join(''))
    print(imageString.size(), imageChunks.join('').size())


    imageChunks.forEach((chunk, index) => {
        print('sent ' + tostring(index), 'size: ' + chunk.size())
        httpService.PostAsync("http://127.0.0.1:5000/upload", chunk, 'TextPlain', false, {index: tostring(index)})
    })
    // const imageUri = httpService.PostAsync("http://127.0.0.1:5000/echo", imageString) // imageString)
}
