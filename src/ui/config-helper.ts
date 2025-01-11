import { getImageDimensions } from "shared/utils"
import uiConstants from "./ui-constants"
import { render } from "shared/render/render.main"

const coreUi = game.GetService("CoreGui")
const selectionService = game.GetService("Selection")

let loadedRender: ModuleScript | undefined 

const edgePart = new Instance("Part")
edgePart.Anchored = true
edgePart.Locked = true
edgePart.Transparency = 1
edgePart.Size = new Vector3(1,1,1)

const handles = new Instance("Handles")
handles.Style = Enum.HandlesStyle.Resize
handles.Color3 = uiConstants.groundColor
handles.Name = "Handles"
handles.Parent = edgePart


export const getRenderSettingsFromSelection = () => {
    print("Testing")
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
    const box = render.FindFirstChild("box") as Folder
    const center = box?.FindFirstChild("center") as Part
    print(box,center)
    if (!box || !center) {
        error("Not a valid render settings object")
    }
    cleanUpLastLoadedRender()

    const positions = getHandlePositions(render)
}

const cleanUpLastLoadedRender = () => {
    loadedRender = undefined
}

export const getHandlePositions = (renderSettings: ModuleScript) => {
    const box = renderSettings.FindFirstChild("box") as Folder
    const center = box?.FindFirstChild("center") as Part
    const mesh = center?.FindFirstChild("mesh") as BlockMesh
    print(center.GetChildren())
    if (!mesh) {
        return
    }
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
