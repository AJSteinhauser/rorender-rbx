const selectionService = game.GetService("Selection")
let loadedRenderRef: ModuleScript | undefined 
let connections: RBXScriptConnection[] = []

export enum QuickSelect {
    C0,
    C1,
    Module
}

export const getRenderSettingsFromSelection = () => {
    const currentSelection = selectionService.Get()
    if (currentSelection.size() !== 1) {
        warn("Please only select the render settings ModuleScript")
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
}

const getRandomRenderSettings = () => {
    const randomSettings = game.Workspace.FindFirstChild("RoRenderSettings") as ModuleScript
    if (randomSettings) {
        const [success] = pcall(() => {
            getElementsFromSettings(randomSettings)
        })
        if (success) {
            loadRender(randomSettings)
        }
    }
}

export const autoConfigureRenderBox = () => {
    const settings = getCurrentRender()
    if (!settings) {
        error("Must be in configuration mode to configure a box")
    }
    const { c0, c1, center, mesh } = getElementsFromSettings(settings)
    const [position, scale] = game.Workspace.GetBoundingBox()

    const c0offset = scale.mul(new Vector3(-.5, .5, -.5))
    const c1offset = scale.mul(new Vector3(.5, -.5, .5))
    c0.CFrame = position.mul(new CFrame(c0offset))
    c1.CFrame = position.mul(new CFrame(c1offset))

    center.CFrame = position
    mesh.Scale = scale
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
    connections.forEach(x => x.Disconnect())
    selectionService.Set([])
}

const setupUpdateConnections = (render: ModuleScript) => {
    const { c0, c1, mesh } = getElementsFromSettings(render)

    const c0PositionConnection = c0.GetPropertyChangedSignal("Position")
    const c1PositionConnection = c1.GetPropertyChangedSignal("Position")

    connections.push(
        c0PositionConnection.Connect(() => {
            updateBoxFromHandles(render)
        }),
        c1PositionConnection.Connect(() => {
            updateBoxFromHandles(render)
        })
    )
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
