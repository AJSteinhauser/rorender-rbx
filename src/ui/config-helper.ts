import { getImageDimensions } from "shared/utils"
import uiConstants from "./ui-constants"
import { render } from "shared/render/render.main"

const coreUi = game.GetService("CoreGui")
const selectionService = game.GetService("Selection")

let loadedRenderRef: ModuleScript | undefined 

export const getRenderSettingsFromSelection = () => {
    const currentSelection = selectionService.Get()
    if (currentSelection.size() !== 1) {
        error("Please only select the render settings ModuleScript")
    }
    const settingsModule = currentSelection[0] as ModuleScript
    if (settingsModule.ClassName !== "ModuleScript") {
        error("Please only select the render settings ModuleScript")
    }
    loadRender(settingsModule)
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

const setHandlesInCorrectPosition = (render: ModuleScript) => {
    const { c0, c1 } = getElementsFromSettings(render)

    const positions = getHandlePositions(render)
    c0.CFrame = positions.c0
    c1.CFrame = positions.c1
}

const cleanUpLastLoadedRender = () => {
    loadedRenderRef = undefined
    selectionService.Set([])
}

const setupUpdateConnections = (render: ModuleScript) => {
    const { c0, c1, mesh } = getElementsFromSettings(render)

    const c0PositionConnection = c0.GetPropertyChangedSignal("Position")
    const c1PositionConnection = c1.GetPropertyChangedSignal("Position")
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
