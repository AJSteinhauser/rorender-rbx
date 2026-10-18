/// <reference types="@rbxts/testez/globals" />

import { Settings } from "shared/settings/settings.model"
import { lookupHeightShift } from "./render.utils"
import {
    Blockcaster,
    buildHeightPrepass,
    chainedBlockcast,
    HEIGHT_PREPASS_BAIL_MISS_RATIO,
    HEIGHT_PREPASS_CELL_WORLD_SIZE,
    HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL,
    MAX_SHAPECAST_DISTANCE,
    MAX_SHAPECAST_SEGMENTS
} from "./height-prepass"

const EPSILON = 1e-3
const TOP_Y = 10000
const MARGIN = HEIGHT_PREPASS_CELL_WORLD_SIZE
const BOX = new Vector3(4, 1, 4)
const DOWN = new Vector3(0, -1, 0)

interface BlockcastCall {
    origin: CFrame
    direction: Vector3
}

const fakeHit = (position: Vector3) =>
    ({ Position: position }) as unknown as RaycastResult

const recordingBlockcaster = (
    respond: (call: BlockcastCall, index: number) => Vector3 | undefined = () =>
        undefined
) => {
    const calls: BlockcastCall[] = []
    const blockcast: Blockcaster = (origin, _size, direction) => {
        const call = { origin, direction }
        calls.push(call)
        const position = respond(call, calls.size() - 1)
        return position ? fakeHit(position) : undefined
    }
    return { calls, blockcast }
}

type DepthAtCell = (cx: number, cz: number) => number | undefined

const groundWorld = (depthAtCell: DepthAtCell) =>
    recordingBlockcaster(({ origin, direction }) => {
        const cx = math.floor(origin.X / HEIGHT_PREPASS_CELL_WORLD_SIZE)
        const cz = math.floor(origin.Z / HEIGHT_PREPASS_CELL_WORLD_SIZE)
        const depth = depthAtCell(cx, cz)
        if (depth === undefined) return undefined
        const groundY = TOP_Y - depth
        const segmentBottomY = origin.Y + direction.Y
        const groundInSegment = groundY <= origin.Y && groundY >= segmentBottomY
        return groundInSegment
            ? new Vector3(origin.X, groundY, origin.Z)
            : undefined
    })

const buildSettings = (resolution = 1): Settings => ({
    mapScale: new Vector3(1, 1, 1),
    mapCFrame: new CFrame(),
    resolution,
    terrain: [],
    buildingGroups: [],
    roadGroups: [],
    water: { name: "water" },
    samples: 1,
    shadows: {
        enabled: false,
        sunDirection: new Vector3(0, -1, 0),
        darkness: 0
    },
    actors: 1
})

const runPrepass = (
    blockcast: Blockcaster,
    cellsX: number,
    cellsZ: number,
    rayLength: number,
    resolution = 1
) => {
    const cellPixelSize = HEIGHT_PREPASS_CELL_WORLD_SIZE / resolution
    return buildHeightPrepass(
        buildSettings(resolution),
        new CFrame(0, TOP_Y, 0),
        DOWN.mul(rayLength),
        rayLength,
        new Vector2(cellsX * cellPixelSize, cellsZ * cellPixelSize),
        blockcast
    )
}

const sideForCellCount = (cellCount: number) => math.ceil(math.sqrt(cellCount))

export = () => {
    describe("chainedBlockcast", () => {
        it("should issue a single cast when the distance fits in one shapecast", () => {
            const { calls, blockcast } = recordingBlockcaster()
            chainedBlockcast(
                new CFrame(),
                BOX,
                DOWN.mul(500),
                new RaycastParams(),
                blockcast
            )
            expect(calls.size()).to.equal(1)
            expect(calls[0].direction.Magnitude).to.be.near(500, EPSILON)
        })

        it("should not split a cast of exactly the max shapecast distance", () => {
            const { calls, blockcast } = recordingBlockcaster()
            chainedBlockcast(
                new CFrame(),
                BOX,
                DOWN.mul(MAX_SHAPECAST_DISTANCE),
                new RaycastParams(),
                blockcast
            )
            expect(calls.size()).to.equal(1)
        })

        it("should split one stud past the limit into a full segment and a 1 stud tail", () => {
            const { calls, blockcast } = recordingBlockcaster()
            chainedBlockcast(
                new CFrame(),
                BOX,
                DOWN.mul(MAX_SHAPECAST_DISTANCE + 1),
                new RaycastParams(),
                blockcast
            )
            expect(calls.size()).to.equal(2)
            expect(calls[0].direction.Magnitude).to.be.near(
                MAX_SHAPECAST_DISTANCE,
                EPSILON
            )
            expect(calls[1].direction.Magnitude).to.be.near(1, EPSILON)
        })

        it("should not emit a zero length trailing segment on exact multiples", () => {
            const { calls, blockcast } = recordingBlockcaster()
            chainedBlockcast(
                new CFrame(),
                BOX,
                DOWN.mul(MAX_SHAPECAST_DISTANCE * 3),
                new RaycastParams(),
                blockcast
            )
            expect(calls.size()).to.equal(3)
            calls.forEach((call) =>
                expect(call.direction.Magnitude).to.be.near(
                    MAX_SHAPECAST_DISTANCE,
                    EPSILON
                )
            )
        })

        it("should cast nothing for a zero length direction", () => {
            const { calls, blockcast } = recordingBlockcaster()
            const hit = chainedBlockcast(
                new CFrame(),
                BOX,
                Vector3.zero,
                new RaycastParams(),
                blockcast
            )
            expect(calls.size()).to.equal(0)
            expect(hit).never.to.be.ok()
        })

        it("should tile the full path with contiguous, gap free, in-limit segments", () => {
            const direction = new Vector3(3, -10, 2).Unit.mul(3333)
            const origin = new CFrame(7, 50, -9).mul(CFrame.Angles(0, 1, 0))
            const { calls, blockcast } = recordingBlockcaster()
            chainedBlockcast(
                origin,
                BOX,
                direction,
                new RaycastParams(),
                blockcast
            )

            expect(calls.size()).to.equal(
                math.ceil(direction.Magnitude / MAX_SHAPECAST_DISTANCE)
            )
            let expectedOrigin = origin.Position
            let travelled = 0
            calls.forEach((call) => {
                expect(
                    call.direction.Magnitude <= MAX_SHAPECAST_DISTANCE
                ).to.equal(true)
                expect(call.direction.Unit.Dot(direction.Unit)).to.be.near(
                    1,
                    EPSILON
                )
                expect(
                    call.origin.Position.sub(expectedOrigin).Magnitude
                ).to.be.near(0, EPSILON)
                expect(
                    call.origin.LookVector.Dot(origin.LookVector)
                ).to.be.near(1, EPSILON)
                expectedOrigin = expectedOrigin.add(call.direction)
                travelled += call.direction.Magnitude
            })
            expect(travelled).to.be.near(direction.Magnitude, EPSILON)
            expect(
                expectedOrigin.sub(origin.Position.add(direction)).Magnitude
            ).to.be.near(0, EPSILON)
        })

        it("should return the first hit and stop casting further segments", () => {
            const hitPosition = new Vector3(0, -1500, 0)
            const { calls, blockcast } = recordingBlockcaster((_, index) =>
                index === 1 ? hitPosition : undefined
            )
            const hit = chainedBlockcast(
                new CFrame(),
                BOX,
                DOWN.mul(MAX_SHAPECAST_DISTANCE * 5),
                new RaycastParams(),
                blockcast
            )
            expect(calls.size()).to.equal(2)
            expect(hit?.Position).to.equal(hitPosition)
        })

        it("should give up after the segment cap even if distance remains", () => {
            const { calls, blockcast } = recordingBlockcaster()
            const hit = chainedBlockcast(
                new CFrame(),
                BOX,
                DOWN.mul(
                    MAX_SHAPECAST_DISTANCE * (MAX_SHAPECAST_SEGMENTS + 10)
                ),
                new RaycastParams(),
                blockcast
            )
            expect(calls.size()).to.equal(MAX_SHAPECAST_SEGMENTS)
            expect(hit).never.to.be.ok()
        })

        it("should hit a real part far beyond a single shapecast's reach", () => {
            const depth = MAX_SHAPECAST_DISTANCE * 2.5
            const farAway = new Vector3(60000, 0, 60000)
            const part = new Instance("Part")
            part.Anchored = true
            part.Size = new Vector3(20, 2, 20)
            part.CFrame = new CFrame(farAway)
            part.Parent = game.Workspace

            const params = new RaycastParams()
            params.FilterType = Enum.RaycastFilterType.Include
            params.AddToFilter(part)

            try {
                const partTopY = farAway.Y + part.Size.Y / 2
                const hit = chainedBlockcast(
                    new CFrame(farAway.add(new Vector3(0, depth, 0))),
                    BOX,
                    DOWN.mul(depth + 10),
                    params
                )
                expect(hit).to.be.ok()
                expect(hit?.Instance).to.equal(part)
                expect(hit?.Position.Y).to.be.near(partTopY, 1)
            } finally {
                part.Destroy()
            }
        })
    })

    describe("buildHeightPrepass shifts", () => {
        it("should find ground deeper than one shapecast and shift to just above it", () => {
            const depth = MAX_SHAPECAST_DISTANCE * 3 - 100
            const { calls, blockcast } = groundWorld(() => depth)
            const grid = runPrepass(blockcast, 2, 2, depth + 500)

            grid.shifts.forEach((shift) =>
                expect(shift).to.be.near(depth - MARGIN, EPSILON)
            )
            expect(calls.size()).to.equal(4 * 3)
        })

        it("should not shift when ground sits within the safety margin", () => {
            const { blockcast } = groundWorld(() => MARGIN / 2)
            const grid = runPrepass(blockcast, 2, 2, 500)
            grid.shifts.forEach((shift) => expect(shift).to.equal(0))
        })

        it("should fall back to the top of the box for columns with nothing in them", () => {
            const { blockcast } = groundWorld((cx) =>
                cx === 0 ? 300 : undefined
            )
            const grid = runPrepass(blockcast, 2, 1, 500)
            expect(grid.shifts[0]).to.be.near(300 - MARGIN, EPSILON)
            expect(grid.shifts[1]).to.equal(0)
        })

        it("should fall back to the top of the box when ground is beyond the segment cap", () => {
            const unreachable =
                MAX_SHAPECAST_DISTANCE * MAX_SHAPECAST_SEGMENTS + 50
            const { blockcast } = groundWorld(() => unreachable)
            const grid = runPrepass(blockcast, 1, 1, unreachable + 100)
            expect(grid.shifts[0]).to.equal(0)
        })

        it("should cover partial edge cells", () => {
            const { blockcast } = groundWorld(() => 100)
            const grid = buildHeightPrepass(
                buildSettings(),
                new CFrame(0, TOP_Y, 0),
                DOWN.mul(500),
                500,
                new Vector2(HEIGHT_PREPASS_CELL_WORLD_SIZE * 2 + 1, 1),
                blockcast
            )
            expect(grid.cellsX).to.equal(3)
            expect(grid.cellsZ).to.equal(1)
            expect(grid.shifts.size()).to.equal(3)
        })

        it("should space cells one cell world size apart regardless of resolution", () => {
            const { calls, blockcast } = groundWorld(() => 100)
            const grid = runPrepass(blockcast, 3, 1, 500, 4)
            expect(grid.cellPixelSize).to.be.near(
                HEIGHT_PREPASS_CELL_WORLD_SIZE / 4,
                EPSILON
            )
            expect(calls[1].origin.X - calls[0].origin.X).to.be.near(
                HEIGHT_PREPASS_CELL_WORLD_SIZE,
                EPSILON
            )
        })

        it("should agree with lookupHeightShift for every pixel in every cell", () => {
            const cellsX = 3
            const cellsZ = 2
            const depthFor = (cx: number, cz: number) =>
                100 * (cz * cellsX + cx + 1)
            const { blockcast } = groundWorld(depthFor)
            const grid = runPrepass(blockcast, cellsX, cellsZ, 1000)

            for (let pz = 0; pz < cellsZ * MARGIN; pz++) {
                for (let px = 0; px < cellsX * MARGIN; px++) {
                    const expected =
                        depthFor(
                            math.floor(px / MARGIN),
                            math.floor(pz / MARGIN)
                        ) - MARGIN
                    expect(
                        lookupHeightShift(grid, new Vector2(px, pz))
                    ).to.be.near(expected, EPSILON)
                }
            }
        })
    })

    describe("buildHeightPrepass bail heuristic", () => {
        const side = sideForCellCount(HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL) + 2
        const totalCells = side * side

        it("should stop casting once the minimum sample is overwhelmingly empty", () => {
            const { calls, blockcast } = groundWorld(() => undefined)
            const grid = runPrepass(blockcast, side, side, 500)

            expect(calls.size()).to.equal(HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL)
            expect(grid.shifts.size()).to.equal(totalCells)
            grid.shifts.forEach((shift) => expect(shift).to.equal(0))
        })

        it("should count a fully missed chain as one miss, not one per segment", () => {
            const { calls, blockcast } = groundWorld(() => undefined)
            const segmentsPerCell = 3
            runPrepass(
                blockcast,
                side,
                side,
                MAX_SHAPECAST_DISTANCE * segmentsPerCell
            )
            expect(calls.size()).to.equal(
                HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL * segmentsPerCell
            )
        })

        it("should never bail on maps smaller than the minimum sample", () => {
            const smallSide =
                sideForCellCount(HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL) - 2
            const { calls, blockcast } = groundWorld(() => undefined)
            runPrepass(blockcast, smallSide, smallSide, 500)
            expect(calls.size()).to.equal(smallSide * smallSide)
        })

        it("should keep casting when hits are common", () => {
            const { calls, blockcast } = groundWorld((cx, cz) =>
                (cx + cz) % 2 === 0 ? 200 : undefined
            )
            runPrepass(blockcast, side, side, 500)
            expect(calls.size()).to.equal(totalCells)
        })

        it("should survive a long empty edge (e.g. ocean) just under the bail ratio", () => {
            const emptyLeadingCells =
                math.floor(
                    HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL *
                        HEIGHT_PREPASS_BAIL_MISS_RATIO
                ) - 1
            const { calls, blockcast } = groundWorld((cx, cz) =>
                cz * side + cx < emptyLeadingCells ? undefined : 200
            )
            const grid = runPrepass(blockcast, side, side, 500)

            expect(calls.size()).to.equal(totalCells)
            expect(grid.shifts[totalCells - 1]).to.be.near(
                200 - MARGIN,
                EPSILON
            )
        })

        it("should stay bailed even if later cells would have hit", () => {
            const { calls, blockcast } = groundWorld((cx, cz) =>
                cz * side + cx < HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL
                    ? undefined
                    : 200
            )
            const grid = runPrepass(blockcast, side, side, 500)

            expect(calls.size()).to.equal(HEIGHT_PREPASS_MIN_CELLS_BEFORE_BAIL)
            expect(grid.shifts[totalCells - 1]).to.equal(0)
        })
    })
}
