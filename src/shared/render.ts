import { Pixel } from "./render.model";
import { computePixel } from "./render.utils";
import { Settings } from "./settings.model";
import { convertImageToString, getImageDimensions, splitImageIntoChunks } from "./utils";
const httpService = game.GetService("HttpService");
const lighting = game.GetService("Lighting");

const partTemplate = new Instance("Part")
partTemplate.Size = new Vector3(1, 1, 1)
partTemplate.CanCollide = false
partTemplate.Color = Color3.fromRGB(255, 0, 0)
partTemplate.Anchored = true

const LIGHT_COLOR = Color3.fromRGB(255, 255, 255)
const SUN_POSITION = lighting.GetSunDirection()
const DELAY_TIME = 5

function delayForScriptExhuastion(startTime: number): void {
    if (tick() - startTime > DELAY_TIME) {
        task.wait(.1)
    }
}

export function render(settings: Settings): void {
    const imageDimensions = getImageDimensions(settings)
    const rayLength = math.abs(settings.corners.topRight.Y - settings.corners.bottomLeft.Y)

    const image = new Array<Pixel>(imageDimensions.X * imageDimensions.Y);

    const xSpacing = math.abs(settings.corners.bottomLeft.X - settings.corners.topRight.X) / imageDimensions.X
    const ySpacing = math.abs(settings.corners.bottomLeft.Z - settings.corners.topRight.Z) / imageDimensions.Y

    let startTime = tick()
    
    for (let y = 0; y < imageDimensions.Y; y++) {
        for (let x = 0; x < imageDimensions.X; x++) {
            delayForScriptExhuastion(startTime)
            const rayPosition = new Vector3(
                settings.corners.topRight.X + xSpacing * x,
                settings.corners.topRight.Y,
                settings.corners.topRight.Z + ySpacing * y
            )
            image.push(computePixel(rayPosition, settings, rayLength))
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
