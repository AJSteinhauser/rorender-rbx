import { Settings } from "shared/settings/settings.model"

const selectionService = game.GetService("Selection")
let loadedRenderRef: ModuleScript | undefined 
let connections: RBXScriptConnection[] = []
let imageSizeHook: React.Dispatch<React.SetStateAction<string>> | undefined
let dataHook: React.Dispatch<React.SetStateAction<string>> | undefined
let scaleHook: React.Dispatch<React.SetStateAction<string>> | undefined
let lastData = 0
let lastScale = new Vector3()
let lastImageSize = new Vector2()

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
        settingsModule = settingsModule.FindFirstAncestorWhichIsA("ModuleScript") as ModuleScript
        if (!settingsModule){
            error("Please only select the render settings ModuleScript")
        }
    }
    loadRender(settingsModule)
    return true
}

const getRandomRenderSettings = (): boolean => {
    const randomSettings = game.Workspace.FindFirstChild("RoRenderSettings") as ModuleScript
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
}

export const unloadRender = () => {
    cleanUpLastLoadedRender()
}

export const QuickSelectModule = (item: QuickSelect) => {
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
    connections.forEach(x => x.Disconnect())
    selectionService.Set([])
}

export const setUpdaters = (
    imageSize: React.Dispatch<React.SetStateAction<string>>,
    scale: React.Dispatch<React.SetStateAction<string>>,
    data: React.Dispatch<React.SetStateAction<string>>
): void => {
    imageSizeHook = imageSize
    scaleHook = scale
    dataHook = data
    updateUI()
}

const setupUpdateConnections = (render: ModuleScript) => {
    const { c0, c1, mesh } = getElementsFromSettings(render)

    const c0PositionConnection = c0.GetPropertyChangedSignal("Position")
    const c1PositionConnection = c1.GetPropertyChangedSignal("Position")

    connections.push(
        c0PositionConnection.Connect(() => {
            updateBoxFromHandles(render)
            updateUI()
        }),
        c1PositionConnection.Connect(() => {
            updateBoxFromHandles(render)
            updateUI()
        }),
        render.GetPropertyChangedSignal("Source").Connect(updateUI)
    )
}

export const updateUI = () => {
    const renderSettings = loadedRenderRef
    if (!renderSettings) {
        return
    }
    let resolution = 1
    try {
        resolution = tonumber(renderSettings.Source.match("resolution%s*=%s*(-?%d*%.?%d+)")[0]) || resolution
    }
    catch {
        return
    }
    if (!settings) {
        return
    }
    const { mesh } = getElementsFromSettings(renderSettings)
    updateDepthText()
    updateImageSizeText(resolution, mesh.Scale)
    updateDataText(resolution, mesh.Scale)
}

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
    }
    else if (bytes / 1000000 < 100) {
        dataHook(string.format("%.2fMB", bytes / 1000000))
    }
    else {
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
        scaleHook(string.format("[%.0f, %.0f, %.0f]", mesh.Scale.X, mesh.Scale.Y, mesh.Scale.Z))
    }
    lastScale = mesh.Scale
}

function getImageDimensions(resolution: number, scale: Vector3): Vector2 {
    return new Vector2(
        math.floor(scale.X / resolution),
        math.floor(scale.Z / resolution),
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
        box, center, mesh, c0, c1
    }
}

export const updateBoxFromHandles = (settings: ModuleScript) => {
    const { c0, c1, center, mesh } = getElementsFromSettings(settings)

    const offset = c0.CFrame.PointToObjectSpace(c1.Position)
    mesh.Scale = new Vector3( 
        math.abs(offset.X),
        math.abs(offset.Y),
        math.abs(offset.Z),
    )

    center.Position = (c0.Position.add(c1.Position)).mul(.5) 
}

export function autoConfigureBoundingBox(){
    const settings = getCurrentRender()
    if (!settings) {
        error("No settings module loaded")
    }
    const { c0, c1, center, mesh } = getElementsFromSettings(settings)

    let min = new Vector3(math.huge,math.huge,math.huge)
    let max = new Vector3(-math.huge,-math.huge,-math.huge)

    const workspaceObjects = game.Workspace.GetDescendants()

    workspaceObjects.forEach(object => {
        if (!object.IsA("BasePart") || object.IsA("Terrain")){
            return
        }
        if (object.Transparency >= 1 || object.IsDescendantOf(settings)) {
            return
        }

		const c0 = (object.CFrame.mul(object.Size.div(2)));
		const c1 = (object.CFrame.mul(object.Size.div(-2)));


		max = new Vector3(
			math.max(max.X, c0.X, c1.X),
			math.max(max.Y, c0.Y, c1.Y),
			math.max(max.Z, c0.Z, c1.Z)
		);

		min = new Vector3(
			math.min(min.X, c0.X, c1.X),
			math.min(min.Y, c0.Y, c1.Y),
			math.min(min.Z, c0.Z, c1.Z)
		);
    })

    let centerPos: CFrame = new CFrame()
    let size: Vector3 = new Vector3()

	if (min.X !== math.huge) {
        centerPos = new CFrame(((max.add(min)).div(2)))
        size = (max.sub(min)).add(new Vector3(0,2,0))
    }

    c0.CFrame = centerPos.mul(new CFrame(size.div(-2)))
    c1.CFrame = centerPos.mul(new CFrame(size.div(2)))
}
