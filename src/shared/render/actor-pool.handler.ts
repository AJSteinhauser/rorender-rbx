import { act } from "@rbxts/react-roblox"
import { Settings } from "shared/settings/settings.model"

const actor = script.Parent?.Parent?.Parent?.FindFirstChild(
    "threads"
)?.FindFirstChild("actor") as Actor

export class WorkerPool {
    private actorPoolIntialized = false
    private actorPoolDestroyed = false

    private pool: Actor[] = []
    private tasks: ((actor: Actor) => any)[] = []

    constructor(renderSettings: Settings) {
        this.initializeActors(renderSettings)
        task.spawn(() => {
            while (!this.actorPoolDestroyed) {
                task.wait(0.1)
                if (this.tasks.size() > 0 && this.pool.size() > 0) {
                    for (let actor of this.pool) {
                        const task = this.tasks.pop()
                        if (task) {
                            task(actor)
                        } else {
                            return
                        }
                    }
                }
            }
        })
    }

    private initializeActors = (renderSettings: Settings) => {
        if (this.actorPoolIntialized) {
            return
        }
        if (renderSettings.actors < 1) {
            renderSettings.actors = 1
        }
        this.actorPoolIntialized = true
        for (let i = 0; i < renderSettings.actors; i++) {
            const clone = actor.Clone()
            clone.Parent = actor.Parent
            clone.Parent = actor.Parent
            this.pool.push(clone)
        }
    }

    queueTask = (taskCall: (actor: Actor) => any) => {
        this.tasks.push(taskCall)
    }

    cleanup = () => {
        this.pool.forEach((actor) => actor.Destroy())
        this.pool = []
        this.actorPoolDestroyed = true
    }
}
