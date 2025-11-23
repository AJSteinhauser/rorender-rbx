import { render, renderPreview } from "shared/render/render.main"
import { VIEWFINDER_IMAGE_SIZE } from "shared/render/render.model"
import { Settings } from "shared/settings/settings.model"
import uiConstants from "./ui-constants"
import { object } from "@rbxts/react/src/prop-types"

const lighting = game.GetService("Lighting")
const selectionService = game.GetService("Selection")
const changeHistoryService = game.GetService("ChangeHistoryService")
const assetService = game.GetService("AssetService")
const coreGui = game.GetService("CoreGui")
const studioService = game.GetService("StudioService")

const MAX_IMAGE_SIZE = new Vector2(1024, 1024)
const WATER_COLOR = Color3.fromRGB(66, 135, 245)
const WATER_OPACITY = 0.7
const ISOMETRIC_SCALE = 1.22

let pluginRef: Plugin | undefined
let draggerHandles: Record<Direction, Part> | undefined
let draggerMode: DraggerMode | undefined
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

export enum DraggerMode {
    Move,
    Scale
}

export enum Direction {
    Front,
    Back,
    Left,
    Right,
    Top,
    Bottom
}

const directionTable: Record<Direction, Vector3> = {
    [Direction.Right]: new Vector3(1, 0, 0),
    [Direction.Left]: new Vector3(-1, 0, 0),
    [Direction.Top]: new Vector3(0, 1, 0),
    [Direction.Bottom]: new Vector3(0, -1, 0),
    [Direction.Front]: new Vector3(0, 0, 1),
    [Direction.Back]: new Vector3(0, 0, -1)
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

export const exposePlugin = (plugin: Plugin) => {
    pluginRef = plugin
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

    draggerHandles = createDragHandles()
    setAllDraggerHandlePosition()
    cleanUpOldDragHandles()
}

export const unloadRender = () => {
    cleanUpLastLoadedRender()
}

export const selectModuleScript = () => {
    if (!loadedRenderRef) {
        return
    }
    if (pluginRef) {
        pluginRef.OpenScript(loadedRenderRef)
    }
}

export const setDraggerMode = (mode: DraggerMode) => {
    if (!draggerHandles) return
    draggerMode = mode
    let newHandleStyle: Enum.HandlesStyle = Enum.HandlesStyle.Resize
    if (mode === DraggerMode.Move) {
        newHandleStyle = Enum.HandlesStyle.Movement
    }

    const setDraggerToMode = (handleContainer: Part) => {
        const handle = handleContainer.FindFirstChildOfClass("Handles")
        if (!handle) return
        handle.Style = newHandleStyle
    }
    setDraggerToMode(draggerHandles[Direction.Right])
    setDraggerToMode(draggerHandles[Direction.Left])
    setDraggerToMode(draggerHandles[Direction.Top])
    setDraggerToMode(draggerHandles[Direction.Bottom])
    setDraggerToMode(draggerHandles[Direction.Front])
    setDraggerToMode(draggerHandles[Direction.Back])
}

const createDragHandle = (direction: Direction) => {
    const colorLookUp: Record<Direction, Color3> = {
        [Direction.Right]: new Color3(1, 0, 0),
        [Direction.Left]: new Color3(1, 0, 0),
        [Direction.Top]: new Color3(0, 1, 0),
        [Direction.Bottom]: new Color3(0, 1, 0),
        [Direction.Front]: new Color3(0, 0, 1),
        [Direction.Back]: new Color3(0, 0, 1)
    }

    const handleBasePart = new Instance("Part")
    handleBasePart.Parent = coreGui // game.Workspace.Terrain //coreGui
    handleBasePart.Size = new Vector3(1, 1, 1)
    handleBasePart.Name = `RoRenderHandle-${direction}`
    handleBasePart.Anchored = true

    const handle = new Instance("Handles")
    handle.Color3 = colorLookUp[direction]
    handle.Parent = handleBasePart
    handle.Faces = new Faces(Enum.NormalId.Front)
    handle.Adornee = handleBasePart
    handle.Style = Enum.HandlesStyle.Resize

    if (!loadedRenderRef) return handleBasePart
    const { center, mesh } = getElementsFromSettings(loadedRenderRef)

    let intialDragPosition: CFrame = center.CFrame
    let initialSize: Vector3 = mesh.Scale
    handle.MouseButton1Down.Connect(() => {
        intialDragPosition = center.CFrame
        initialSize = mesh.Scale
    })
    handle.MouseDrag.Connect((_, distance) =>
        dragEvent(direction, distance, intialDragPosition, initialSize)
    )
    handle.MouseButton1Up.Connect(() => {
        changeHistoryService.SetWaypoint("Drag ended")
    })

    return handleBasePart
}

const dragEvent = (
    direction: Direction,
    distance: number,
    intialDragPosition: CFrame,
    initalSize: Vector3
) => {
    if (!loadedRenderRef) return
    distance = distance - (distance % studioService.GridSize)
    const { center, mesh } = getElementsFromSettings(loadedRenderRef)
    if (draggerMode === DraggerMode.Move) {
        const vectorDir = directionTable[direction]
        center.CFrame = intialDragPosition.mul(
            new CFrame(vectorDir.mul(distance))
        )
    } else {
        mesh.Scale = initalSize.add(
            directionTable[direction].Abs().mul(distance)
        )
        const vectorDir = directionTable[direction]
        center.CFrame = intialDragPosition.mul(
            new CFrame(vectorDir.mul(distance / 2))
        )

        const newResolution = calculateResolutionToAchieveImageSize(mesh.Scale)
        replaceResolutionValue(newResolution)
    }
}

export const createDragHandles = () => {
    coreGui.GetChildren().forEach((child) => {
        if (child.Name.match("RoRenderHandle")) {
            child.Destroy()
        }
    })
    const handles: Record<Direction, Part> = {
        [Direction.Right]: createDragHandle(Direction.Right),
        [Direction.Left]: createDragHandle(Direction.Left),
        [Direction.Top]: createDragHandle(Direction.Top),
        [Direction.Bottom]: createDragHandle(Direction.Bottom),
        [Direction.Front]: createDragHandle(Direction.Front),
        [Direction.Back]: createDragHandle(Direction.Back)
    }

    return handles
}

const cleanUpLastLoadedRender = () => {
    loadedRenderRef = undefined
    imageSizeHook = undefined
    dataHook = undefined
    scaleHook = undefined
    closeScreenHook = undefined
    connections.forEach((x) => x.Disconnect())
    selectionService.Set([])
    cleanUpHandles()
}

const cleanUpHandles = () => {
    if (draggerHandles) {
        draggerHandles[Direction.Right].Destroy()
        draggerHandles[Direction.Left].Destroy()
        draggerHandles[Direction.Top].Destroy()
        draggerHandles[Direction.Bottom].Destroy()
        draggerHandles[Direction.Front].Destroy()
        draggerHandles[Direction.Back].Destroy()
    }
}

const setAllDraggerHandlePosition = () => {
    if (!draggerHandles || !loadedRenderRef) return
    const handles = draggerHandles

    const { center, mesh } = getElementsFromSettings(loadedRenderRef)

    const scaleTable: Record<Direction, number> = {
        [Direction.Right]: mesh.Scale.X,
        [Direction.Left]: mesh.Scale.X,
        [Direction.Top]: mesh.Scale.Y,
        [Direction.Bottom]: mesh.Scale.Y,
        [Direction.Front]: mesh.Scale.Z,
        [Direction.Back]: mesh.Scale.Z
    }

    const positionHandle = (direction: Direction) => {
        const part = handles[direction]
        const vectorDir = directionTable[direction]
        const scaleSize = scaleTable[direction]

        const position = center.CFrame.mul(vectorDir.mul(scaleSize / 2))
        const lookVector = position.add(
            position.sub(center.CFrame.Position).Unit.mul(scaleSize * 2)
        )
        part.CFrame = new CFrame(position, lookVector)
    }

    positionHandle(Direction.Right)
    positionHandle(Direction.Left)
    positionHandle(Direction.Front)
    positionHandle(Direction.Back)
    positionHandle(Direction.Top)
    positionHandle(Direction.Bottom)
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
    const { center, mesh } = getElementsFromSettings(render)

    connections.push(
        render.GetPropertyChangedSignal("Source").Connect(updateUI),
        lighting
            .GetPropertyChangedSignal("ClockTime")
            .Connect(() => updateUI()),
        center.Destroying.Connect(() => cleanUpLastLoadedRender()),
        center.GetPropertyChangedSignal("CFrame").Connect(updateUI),
        mesh.GetPropertyChangedSignal("Scale").Connect(updateUI)
    )
}

const cleanUpOldDragHandles = () => {
    if (!loadedRenderRef) return
    const { center } = getElementsFromSettings(loadedRenderRef)
    const c0 = center.FindFirstChild("c0")
    if (c0 && c0.IsA("Part")) {
        c0.Destroy()
    }

    const c1 = center.FindFirstChild("c1")
    if (c1 && c1.IsA("Part")) {
        c1.Destroy()
    }
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
    ensureCenterPartSize(center)
    updateDataText(resolution, mesh.Scale)
    setAllDraggerHandlePosition()
    updatePreviewImageThrottled(mesh.Scale, center.CFrame)
}

const ensureCenterPartSize = (center: Part) => {
    if (center.Size !== new Vector3(1, 1, 1)) {
        center.Size = new Vector3(1, 1, 1)
    }
}

const updatePreviewImageThrottled = throttle(
    updatePreviewImage as (...args: unknown[]) => any,
    0.4
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

    if (!box || !center || !mesh) {
        error("Not a valid settings module")
    }
    return {
        box,
        center,
        mesh
    }
}

export function autoConfigureBoundingBox() {
    const settings = getCurrentRender()
    if (!settings) {
        error("No settings module loaded")
    }
    const { center, mesh } = getElementsFromSettings(settings)

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
        mesh.Scale = size
    }

    setAllDraggerHandlePosition()

    const newResolution = calculateResolutionToAchieveImageSize(size)
    replaceResolutionValue(newResolution)

    changeHistoryService.SetWaypoint("Autoconfig Render Cube")
}

const calculateResolutionToAchieveImageSize = (
    mapScale: Vector3,
    maxMapSize = 1000
): number => {
    const maxAxis = math.max(mapScale.X, mapScale.Z)
    return maxAxis / maxMapSize
}

const replaceResolutionValue = (newResolution: number) => {
    const renderSettings = loadedRenderRef
    if (!renderSettings) {
        return
    }
    const [newSource] = renderSettings.Source.gsub(
        "(resolution%s*=%s*)(-?%d*%.?%d+)",
        "%1" + string.format("%.2f", newResolution)
    )
    renderSettings.Source = newSource
}

const previewSettings = (mapScale: Vector3, mapCFrame: CFrame): Settings => {
    const resolution = mapScale.Z / VIEWFINDER_IMAGE_SIZE.Y
    if (!loadedRenderRef) {
        throw "Failed to load settings"
    }
    const { center } = getElementsFromSettings(loadedRenderRef)

    return {
        mapScale,
        mapCFrame,
        resolution,
        terrain: [game.Workspace.Terrain],
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
    const { center, mesh } = getElementsFromSettings(settings)

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
    changeHistoryService.SetWaypoint("Cube moved")
}

export const convertToIsometric = () => {
    const settings = getCurrentRender()
    if (!settings) {
        error("No settings module loaded")
    }
    const { center, mesh } = getElementsFromSettings(settings)

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
