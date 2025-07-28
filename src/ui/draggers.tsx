import React, { createRef, useState } from "@rbxts/react"
import { createPortal } from "@rbxts/react-roblox"

type direction = "MinusZ" | "PlusZ" | "MinusY" | "PlusY" | "MinusX" | "PlusX"
type handleDefinition = {
    Id: direction
    Offset: CFrame
    Color: Color3
}

const StudioService = game.GetService("StudioService")
const Colors = {
    X_AXIS: new Color3(1, 0, 0),
    Y_AXIS: new Color3(0, 1, 0),
    Z_AXIS: new Color3(0, 0, 1)
}

const HandleDefinitions: Array<handleDefinition> = [
    {
        Id: "MinusZ",
        Offset: CFrame.fromMatrix(
            new Vector3(),
            new Vector3(1, 0, 0),
            new Vector3(0, 1, 0)
        ),
        Color: Colors.Z_AXIS
    },
    {
        Id: "PlusZ",
        Offset: CFrame.fromMatrix(
            new Vector3(),
            new Vector3(1, 0, 0),
            new Vector3(0, -1, 0)
        ),
        Color: Colors.Z_AXIS
    },
    {
        Id: "MinusY",
        Offset: CFrame.fromMatrix(
            new Vector3(),
            new Vector3(0, 0, 1),
            new Vector3(1, 0, 0)
        ),
        Color: Colors.Y_AXIS
    },
    {
        Id: "PlusY",
        Offset: CFrame.fromMatrix(
            new Vector3(),
            new Vector3(0, 0, 1),
            new Vector3(-1, 0, 0)
        ),
        Color: Colors.Y_AXIS
    },
    {
        Id: "MinusX",
        Offset: CFrame.fromMatrix(
            new Vector3(),
            new Vector3(0, 1, 0),
            new Vector3(0, 0, 1)
        ),
        Color: Colors.X_AXIS
    },
    {
        Id: "PlusX",
        Offset: CFrame.fromMatrix(
            new Vector3(),
            new Vector3(0, 1, 0),
            new Vector3(0, 0, -1)
        ),
        Color: Colors.X_AXIS
    }
]

function Snap(x: number, inc: number): number {
    if (inc !== 0) {
        const rem = x % inc
        if (2 * rem !== inc) {
            return ((2 * rem < inc && x) || x + inc) - rem
        }
        return (((x - rem) % (2 * inc) === 0 && x) || x + inc) - rem
    }

    return 0
}

function GethandleBaseCFrame(
    handleDef: handleDefinition,
    cframe: CFrame,
    size: Vector3
): CFrame {
    const Id = handleDef.Id

    const localSize = handleDef.Offset.Inverse().VectorToWorldSpace(size)
    const offsetDueToBoundingBox = 0.5 * math.abs(localSize.Z)
    const handleBaseCFrame = cframe
        .mul(handleDef.Offset)
        .mul(new CFrame(0, 0, -offsetDueToBoundingBox))

    return handleBaseCFrame
}

export function Draggers(props: {
    mode: "Resize" | "Movement"
    onDrag: (
        direction: "MinusZ" | "PlusZ" | "MinusY" | "PlusY" | "MinusX" | "PlusX",
        distance: number
    ) => [CFrame, Vector3]
    onDragged: () => void
    cframe: CFrame
    size: Vector3
    enabled?: boolean
}) {
    const draggers: Record<string, React.ReactNode> = {}
    const partsRef: Record<string, React.RefObject<Part>> = {}
    let mode
    if (props.mode === "Movement") mode = Enum.HandlesStyle.Movement
    else if (props.mode === "Resize") mode = Enum.HandlesStyle.Resize

    for (let i = 0; i < HandleDefinitions.size(); i++) {
        const partRef = createRef<Part>()
        const [lastdistance, setLastdistance] = useState(0)
        const handleDef = HandleDefinitions[i]
        const Id = handleDef.Id
        partsRef[Id] = partRef

        const handleBaseCFrame = GethandleBaseCFrame(
            handleDef,
            props.cframe,
            props.size
        )

        draggers[Id] = (
            <part
                Size={Vector3.zero}
                CFrame={handleBaseCFrame}
                CollisionGroup={"RoRenderDraggers"}
                Transparency={1}
                ref={partRef}
            >
                <handles
                    Adornee={partRef}
                    Style={mode}
                    Color3={handleDef.Color}
                    Faces={new Faces(Enum.NormalId.Front)}
                    Visible={props.enabled}
                    Event={{
                        MouseButton1Down: () => {
                            setLastdistance(0)
                        },
                        MouseDrag: (
                            _rbx: Handles,
                            _face: Enum.NormalId,
                            distance: number
                        ) => {
                            const snapDistance = Snap(
                                distance,
                                StudioService.GridSize
                            )

                            if (lastdistance === snapDistance) return
                            setLastdistance(snapDistance)

                            const [newCFrame, newSize] = props.onDrag(
                                Id,
                                snapDistance
                            )
                            for (let i = 0; i < HandleDefinitions.size(); i++) {
                                const handleDef = HandleDefinitions[i]
                                const Id = handleDef.Id
                                const partRef = partsRef[Id]

                                if (!partRef) continue
                                if (!partRef.current) continue

                                const handleBaseCFrame = GethandleBaseCFrame(
                                    handleDef,
                                    newCFrame,
                                    newSize
                                )

                                partRef.current.CFrame = handleBaseCFrame
                            }
                        },
                        MouseButton1Up: () => {
                            props.onDragged()
                        }
                    }}
                />
            </part>
        )
    }
    return createPortal(
        <folder key={"RoRenderDraggers"}>{draggers}</folder>,
        game.GetService("CoreGui")
    )
}
