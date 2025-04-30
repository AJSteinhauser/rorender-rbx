import { render, renderPreview } from "shared/render/render.main"
import { VIEWFINDER_IMAGE_SIZE } from "shared/render/render.model"
import { Settings } from "shared/settings/settings.model"
import uiConstants from "./ui-constants"

const lighting = game.GetService("Lighting")
const selectionService = game.GetService("Selection")
const changeHistoryService = game.GetService("ChangeHistoryService")
const assetService = game.GetService("AssetService")

const MAX_IMAGE_SIZE = new Vector2(1024, 1024)
const WATER_COLOR = Color3.fromRGB(66, 135, 245)
const WATER_OPACITY = 0.7
const ISOMETRIC_SCALE = 1.22

let loadedRenderRef: ModuleScript | undefined
let viewFinderImage: EditableImage | undefined = undefined
let connections: RBXScriptConnection[] = []
let imageSizeHook: React.Dispatch<React.SetStateAction<string>> | undefined
let dataHook: React.Dispatch<React.SetStateAction<string>> | undefined
let scaleHook: React.Dispatch<React.SetStateAction<string>> | undefined
let closeScreenHook: (() => void) | undefined
let lastData = 0
let lastScale = new Vector3()
let lastImageSize = new Vector2()
let renderWater = false

export enum QuickSelect {
    C0,
    C1,
    Module
}

export const getRenderSettingsFromSelection = (): boolean => {
    const currentSelection = selectionService.Get()
    if (currentSelection.size() !== 1) {
        warn("Attempting to guess random configuration in workspace")
        return getRandomRenderSettings()
    }
    let settingsModule = currentSelection[0] as ModuleScript
    if (settingsModule.ClassName !== "ModuleScript") {
        settingsModule = settingsModule.FindFirstAncestorWhichIsA(
            "ModuleScript"
        ) as ModuleScript
        if (!settingsModule) {
            error("Please only select the render settings ModuleScript")
        }
    }
    loadRender(settingsModule)
    return true
}

export const setViewfinderSettings = (image: EditableImage) => {
    viewFinderImage = image
}

export const updateShowWater = (show: boolean) => {
    renderWater = show
    updateUI()
}

function throttle<T extends (...args: unknown[]) => void>(
    func: T,
    limit: number
): T {
    let initalized = false
    let mostRecentThread: thread

    return function (...args: Parameters<T>) {
        if (!initalized) {
            func(...args)
            initalized = true
            return
        }
        const thread = task.delay(limit, () => {
            if (mostRecentThread === thread) {
                func(...args)
            }
        })
        mostRecentThread = thread
    } as T
}

const updatePreviewImage = (scale: Vector3, cframe: CFrame) => {
    if (!loadedRenderRef || !viewFinderImage) return

    const settings = previewSettings(scale, cframe)
    const imageSize = getImageDimensions(settings.resolution, settings.mapScale)

    if (imageSize.X > MAX_IMAGE_SIZE.X || imageSize.Y > MAX_IMAGE_SIZE.Y) {
        clearViewFinderImage()
        return
    }

    const imageData = renderPreview(settings)
    imageData.then((data) => {
        const tempCanvas = assetService.CreateEditableImage({
            Size: imageSize
        })
        const imageSizeTotal = imageSize.X * imageSize.Y
        const imageBuff = buffer.create(imageSize.X * imageSize.Y * 4)
        for (let i = 0; i < imageSizeTotal; i++) {
            const baseIdx = i * 4
            let outputColor = new Vector3(
                buffer.readu8(data.red, i),
                buffer.readu8(data.green, i),
                buffer.readu8(data.blue, i)
            )
            if (renderWater) {
                if (buffer.readu8(data.water, i) > 0) {
                    outputColor = new Vector3(
                        (1 - WATER_OPACITY) * outputColor.X +
                            WATER_OPACITY * WATER_COLOR.R * 255,
                        (1 - WATER_OPACITY) * outputColor.Y +
                            WATER_OPACITY * WATER_COLOR.G * 255,
                        (1 - WATER_OPACITY) * outputColor.Z +
                            WATER_OPACITY * WATER_COLOR.B * 255
                    )
                }
            }
            buffer.writeu8(imageBuff, baseIdx, outputColor.X)
            buffer.writeu8(imageBuff, baseIdx + 1, outputColor.Y)
            buffer.writeu8(imageBuff, baseIdx + 2, outputColor.Z)
            buffer.writeu8(imageBuff, baseIdx + 3, 255)
        }
        tempCanvas?.WritePixelsBuffer(new Vector2(), imageSize, imageBuff)

        clearViewFinderImage()
        const scaleFit = math.min(
            1,
            VIEWFINDER_IMAGE_SIZE.X / imageSize.X,
            VIEWFINDER_IMAGE_SIZE.Y / imageSize.Y
        )

        viewFinderImage?.DrawImageTransformed(
            VIEWFINDER_IMAGE_SIZE.div(2),
            new Vector2(scaleFit, scaleFit),
            0,
            tempCanvas,
            {
                CombineType: Enum.ImageCombineType.AlphaBlend,
                SamplingMode: Enum.ResamplerMode.Default,
                PivotPoint: tempCanvas.Size.div(2)
            }
        )
    })
}

const clearViewFinderImage = () => {
    const clearBuff = buffer.create(
        VIEWFINDER_IMAGE_SIZE.X * VIEWFINDER_IMAGE_SIZE.Y * 4
    )
    buffer.fill(clearBuff, 0, 0)
    viewFinderImage?.WritePixelsBuffer(
        new Vector2(),
        VIEWFINDER_IMAGE_SIZE,
        clearBuff
    )
    //drawDiagonalLines()
}

const drawDiagonalLines = () => {
    if (!viewFinderImage) return
    const LINE_SPACING = 5
    for (let x = 0; x <= viewFinderImage.Size.X; x += LINE_SPACING) {
        viewFinderImage.DrawLine(
            new Vector2(x, 0),
            new Vector2(viewFinderImage.Size.X - x, viewFinderImage.Size.Y),
            uiConstants.primaryColor,
            0,
            Enum.ImageCombineType.Overwrite
        )
    }
}

const getRandomRenderSettings = (): boolean => {
    const randomSettings = game.Workspace.FindFirstChild(
        "RoRenderSettings"
    ) as ModuleScript
    if (randomSettings) {
        const [success] = pcall(() => {
            getElementsFromSettings(randomSettings)
        })
        if (success) {
            loadRender(randomSettings)
            return true
        }
    }
    return false
}

export const getCurrentRender = () => {
    return loadedRenderRef
}

export const loadRender = (render: ModuleScript) => {
    cleanUpLastLoadedRender()
    setupUpdateConnections(render)

    loadedRenderRef = render
    offsetHandles(loadedRenderRef)
}

export const unloadRender = () => {
    cleanUpLastLoadedRender()
}

export const quickSelectModule = (item: QuickSelect) => {
    if (!loadedRenderRef) {
        return
    }
    const { c0, c1 } = getElementsFromSettings(loadedRenderRef)
    switch (item) {
        case QuickSelect.C0:
            selectionService.Set([c0])
            break
        case QuickSelect.C1:
            selectionService.Set([c1])
            break
        case QuickSelect.Module:
            selectionService.Set([loadedRenderRef])
            break
    }
}

const cleanUpLastLoadedRender = () => {
    loadedRenderRef = undefined
    imageSizeHook = undefined
    dataHook = undefined
    scaleHook = undefined
    closeScreenHook = undefined
    connections.forEach((x) => x.Disconnect())
    selectionService.Set([])
}

export const setUpdaters = (
    imageSize: React.Dispatch<React.SetStateAction<string>>,
    scale: React.Dispatch<React.SetStateAction<string>>,
    data: React.Dispatch<React.SetStateAction<string>>,
    closeScreen: () => void
): void => {
    imageSizeHook = imageSize
    scaleHook = scale
    dataHook = data
    closeScreenHook = closeScreen
    lastData = 0
    lastScale = new Vector3()
    lastImageSize = new Vector2()
    updateUI()
}

const setupUpdateConnections = (render: ModuleScript) => {
    const { c0, c1, center, mesh } = getElementsFromSettings(render)

    const c0PositionConnection = c0.GetPropertyChangedSignal("Position")
    const c1PositionConnection = c1.GetPropertyChangedSignal("Position")
    const centerConnection = c1.Changed as RBXScriptSignal

    connections.push(
        centerConnection.Connect(() => {
            center.Size = new Vector3(1, 1, 1)
            updateUI()
        }),
        c0PositionConnection.Connect(() => {
            updateBoxFromHandles(render)
            updateUI()
        }),
        c1PositionConnection.Connect(() => {
            updateBoxFromHandles(render)
            updateUI()
        }),
        render.GetPropertyChangedSignal("Source").Connect(updateUI),
        lighting
            .GetPropertyChangedSignal("ClockTime")
            .Connect(() => updateUI()),
        center.Destroying.Connect(() => cleanUpLastLoadedRender())
    )
}

export const updateUI = () => {
    const renderSettings = loadedRenderRef
    if (!renderSettings) {
        return
    }
    let resolution = 1
    try {
        resolution =
            tonumber(
                renderSettings.Source.match("resolution%s*=%s*(-?%d*%.?%d+)")[0]
            ) || resolution
    } catch {
        return
    }
    if (!settings) {
        return
    }
    const { mesh, center } = getElementsFromSettings(renderSettings)
    updateDepthText()
    updateImageSizeText(resolution, mesh.Scale)
    updateDataText(resolution, mesh.Scale)
    updatePreviewImageThrottled(mesh.Scale, center.CFrame)
}

const updatePreviewImageThrottled = throttle(
    updatePreviewImage as (...args: unknown[]) => any,
    0.3
)

function updateDataText(resolution: number, scale: Vector3) {
    if (!dataHook) {
        return
    }
    const imageSize = getImageDimensions(resolution, scale)
    const bytes = imageSize.X * imageSize.Y * 8
    if (lastData === bytes) {
        return
    }
    if (bytes / 1000 < 100) {
        dataHook(string.format("%.2fKB", bytes / 1000))
    } else if (bytes / 1000000 < 100) {
        dataHook(string.format("%.2fMB", bytes / 1000000))
    } else {
        dataHook(string.format("%.2fGB", bytes / 1000000000))
    }
    if (imageSize !== lastImageSize) {
        dataHook(`${imageSize.X}px x ${imageSize.Y}px`)
    }
    lastData = bytes
}

function updateDepthText(): void {
    if (!scaleHook || !loadedRenderRef) {
        return
    }
    const { mesh } = getElementsFromSettings(loadedRenderRef)
    if (lastScale !== mesh.Scale) {
        scaleHook(
            string.format(
                "[%.0f, %.0f, %.0f]",
                mesh.Scale.X,
                mesh.Scale.Y,
                mesh.Scale.Z
            )
        )
    }
    lastScale = mesh.Scale
}

function getImageDimensions(resolution: number, scale: Vector3): Vector2 {
    return new Vector2(
        math.floor(scale.X / resolution),
        math.floor(scale.Z / resolution)
    )
}

function updateImageSizeText(resolution: number, scale: Vector3): void {
    if (!imageSizeHook) {
        return
    }
    const imageSize = getImageDimensions(resolution, scale)
    if (imageSize !== lastImageSize) {
        imageSizeHook(`${imageSize.X}px x ${imageSize.Y}px`)
    }
    lastImageSize = imageSize
}

const getElementsFromSettings = (settings: ModuleScript) => {
    const box = settings.FindFirstChild("box") as Folder
    const center = box?.FindFirstChild("center") as Part
    const mesh = center?.FindFirstChild("mesh") as BlockMesh
    const c0 = center?.FindFirstChild("c1") as Part
    const c1 = center?.FindFirstChild("c0") as Part

    if (!box || !center || !mesh || !c0 || !c1) {
        error("Not a valid settings module")
    }
    return {
        box,
        center,
        mesh,
        c0,
        c1
    }
}

const offsetHandles = (settings: ModuleScript) => {
    const { c0, c1, center, mesh } = getElementsFromSettings(settings)

    if (c0.Position === c1.Position) {
        c0.CFrame = new CFrame(
            center.CFrame.mul(mesh.Scale.mul(new Vector3(-0.5, -0.5, -0.5)))
        )
        c1.CFrame = new CFrame(
            center.CFrame.mul(mesh.Scale.mul(new Vector3(0.5, 0.5, 0.5)))
        )
    }
}

export const updateBoxFromHandles = (settings: ModuleScript) => {
    const { c0, c1, center, mesh } = getElementsFromSettings(settings)

    const offset = c0.CFrame.PointToObjectSpace(c1.Position)
    mesh.Scale = new Vector3(
        math.abs(offset.X),
        math.abs(offset.Y),
        math.abs(offset.Z)
    )

    center.Position = c0.Position.add(c1.Position).mul(0.5)
}

export function autoConfigureBoundingBox() {
    const settings = getCurrentRender()
    if (!settings) {
        error("No settings module loaded")
    }
    const { c0, c1, center, mesh } = getElementsFromSettings(settings)

    let min = new Vector3(math.huge, math.huge, math.huge)
    let max = new Vector3(-math.huge, -math.huge, -math.huge)

    const workspaceObjects = game.Workspace.GetDescendants()

    workspaceObjects.forEach((object) => {
        if (!object.IsA("BasePart") || object.IsA("Terrain")) {
            return
        }
        if (object.Transparency >= 1 || object.IsDescendantOf(settings)) {
            return
        }

        const c0 = object.CFrame.mul(object.Size.div(2))
        const c1 = object.CFrame.mul(object.Size.div(-2))

        max = new Vector3(
            math.max(max.X, c0.X, c1.X),
            math.max(max.Y, c0.Y, c1.Y),
            math.max(max.Z, c0.Z, c1.Z)
        )

        min = new Vector3(
            math.min(min.X, c0.X, c1.X),
            math.min(min.Y, c0.Y, c1.Y),
            math.min(min.Z, c0.Z, c1.Z)
        )
    })

    let centerPos: CFrame = new CFrame()
    let size: Vector3 = new Vector3()

    if (min.X !== math.huge) {
        centerPos = new CFrame(max.add(min).div(2))
        size = max.sub(min).add(new Vector3(0, 2, 0))
        center.CFrame = centerPos
    }

    c0.CFrame = centerPos.mul(new CFrame(size.div(-2)))
    c1.CFrame = centerPos.mul(new CFrame(size.div(2)))

    changeHistoryService.SetWaypoint("Autoconfig Render Cube")
}

const previewSettings = (mapScale: Vector3, mapCFrame: CFrame): Settings => {
    const resolution = mapScale.Z / VIEWFINDER_IMAGE_SIZE.Y
    return {
        mapScale,
        mapCFrame,
        resolution,
        terrain: [],
        buildingGroups: [],
        roadGroups: [],
        water: {
            name: "water",
            materials: [Enum.Material.Water]
        },
        samples: 0,
        shadows: {
            enabled: false,
            sunDirection: lighting.GetSunDirection(),
            darkness: 0.3
        },
        actors: 50
    }
}

export enum CubeMoveDirection {
    Forward,
    Backward,
    Left,
    Right
}
export const moveRenderBox = (direction: CubeMoveDirection) => {
    const settings = getCurrentRender()
    if (!settings) {
        error("No settings module loaded")
    }
    const { c0, c1, center, mesh } = getElementsFromSettings(settings)

    const size = mesh.Scale
    let offset: CFrame
    switch (direction) {
        case CubeMoveDirection.Forward: {
            offset = new CFrame(mesh.Scale.mul(new Vector3(0, 0, 1)))
            break
        }
        case CubeMoveDirection.Backward: {
            offset = new CFrame(mesh.Scale.mul(new Vector3(0, 0, -1)))
            break
        }

        case CubeMoveDirection.Right: {
            offset = new CFrame(mesh.Scale.mul(new Vector3(1, 0, 0)))
            break
        }
        case CubeMoveDirection.Left: {
            offset = new CFrame(mesh.Scale.mul(new Vector3(-1, 0, 0)))
            break
        }
    }

    center.CFrame = center.CFrame.mul(offset)
    c0.CFrame = c0.CFrame.mul(offset)
    c1.CFrame = c1.CFrame.mul(offset)
    changeHistoryService.SetWaypoint("Cube moved")
}

export const convertToIsometric = () => {
    const settings = getCurrentRender()
    if (!settings) {
        error("No settings module loaded")
    }
    const { c0, c1, center, mesh } = getElementsFromSettings(settings)

    const originalCFrame = center.CFrame
    const originalSize = mesh.Scale

    const isoDegX = math.rad(35)
    const isoDegY = math.rad(45)
    const isoDegZ = math.rad(0)

    const camRotation = CFrame.fromOrientation(isoDegX, isoDegY, isoDegZ)

    const corners = [
        new Vector3(-0.5, -0.5, -0.5),
        new Vector3(0.5, -0.5, -0.5),
        new Vector3(-0.5, 0.5, -0.5),
        new Vector3(0.5, 0.5, -0.5),
        new Vector3(-0.5, -0.5, 0.5),
        new Vector3(0.5, -0.5, 0.5),
        new Vector3(-0.5, 0.5, 0.5),
        new Vector3(0.5, 0.5, 0.5)
    ].map((corner) => originalCFrame.mul(corner.mul(originalSize)))

    const rotatedCorners = corners.map((corner) => {
        const relativePosition = corner.sub(originalCFrame.Position)
        const rotatedPosition = camRotation.mul(relativePosition)
        return rotatedPosition
    })

    let minX = math.huge
    let maxX = -math.huge

    let minY = math.huge
    let maxY = -math.huge

    let minZ = math.huge
    let maxZ = -math.huge

    rotatedCorners.forEach((corner) => {
        minX = math.min(minX, corner.X)
        minY = math.min(minY, corner.Y)
        minZ = math.min(minZ, corner.Z)

        maxX = math.max(maxX, corner.X)
        maxY = math.max(maxY, corner.Y)
        maxZ = math.max(maxZ, corner.Z)
    })

    const newSize = new Vector3(
        (maxX - minX) * ISOMETRIC_SCALE,
        (maxY - minY) * ISOMETRIC_SCALE,
        (maxZ - minZ) * ISOMETRIC_SCALE
    )

    const newPosition = new Vector3(
        (maxX + minX) / 2,
        (maxY + minY) / 2,
        (maxZ + minZ) / 2
    )

    mesh.Scale = newSize
    center.CFrame = new CFrame(newPosition).mul(camRotation)
}

export const convertMeshCollisionBoxes = () => {
    game.Workspace.GetDescendants().forEach((instance) => {
        if (!instance.IsA("MeshPart")) {
            return
        }
        instance.CollisionFidelity =
            Enum.CollisionFidelity.PreciseConvexDecomposition
    })
}
