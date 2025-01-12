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
        error("Please only select the render settings ModuleScript")
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

export const getCurrentRender = () => {
    return loadedRenderRef
}

export const loadRender = (render: ModuleScript) => {
    cleanUpLastLoadedRender()
    setHandlesInCorrectPosition(render)
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

const setHandlesInCorrectPosition = (render: ModuleScript) => {
    const { c0, c1 } = getElementsFromSettings(render)

    const positions = getHandlePositions(render)
    c0.CFrame = positions.c0
    c1.CFrame = positions.c1
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

export const getHandlePositions = (renderSettings: ModuleScript) => {
    const { center, mesh } = getElementsFromSettings(renderSettings)
    const c0_offset = new CFrame(
        new Vector3(
            -(mesh.Scale.X / 2),
             (mesh.Scale.Y / 2),
            -(mesh.Scale.Z / 2),
        )
    )
    const c1_offset = new CFrame(
        new Vector3(
             (mesh.Scale.X / 2),
            -(mesh.Scale.Y / 2),
             (mesh.Scale.Z / 2),
        )
    )

    return {
        c0: c0_offset.mul(center.CFrame),
        c1: c1_offset.mul(center.CFrame) 
    }
}

export const updateBoxFromHandles = (settings: ModuleScript) => {
    const { c0, c1, center, mesh } = getElementsFromSettings(settings)

    const leftMost = c0.CFrame.Position.X < c1.CFrame.Position.X ?  c0 : c1
    const rightMost = leftMost === c0 ?  c1 : c0

    const frontMost = c0.CFrame.Position.Z < c1.CFrame.Position.Z ?  c1 : c0
    const backMost = frontMost === c0 ?  c1 : c0

    const topMost = c0.CFrame.Position.Y < c1.CFrame.Position.Y ? c1 : c0
    const bottomMost = topMost === c0 ? c1 : c0

    const xScale = (rightMost.CFrame.Position.sub(leftMost.CFrame.Position)).X
    const yScale = (topMost.CFrame.Position.sub(bottomMost.CFrame.Position)).Y
    const zScale = (frontMost.CFrame.Position.sub(backMost.CFrame.Position)).Z

    const centerPoint = c0.CFrame.Position.Lerp(c1.CFrame.Position, .5)
    center.CFrame = new CFrame(centerPoint)

    mesh.Scale = new Vector3(
        xScale,
        yScale,
        zScale
    )
}
