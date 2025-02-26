import { act } from "@rbxts/react-roblox"
import { Settings } from "shared/settings/settings.model"

const actor = script.Parent?.Parent?.Parent?.FindFirstChild("threads")?.FindFirstChild("actor") as Actor

export class WorkerPool {
    private actorPoolIntialized = false

    private pool: Actor[] = []
    private actorAddedBackToPool = new Instance("BindableEvent")
    private waitingPool: ((value: Actor | Promise<Actor>) => void)[] = []

    constructor(renderSettings: Settings) {
        this.initializeActors(renderSettings)
        this.actorAddedBackToPool.Event.Connect(() => {
            const resolve = this.waitingPool.shift()
            if (resolve) {
                const actor = this.pool.shift()
                if (!actor) {
                    this.waitingPool.push(resolve)
                    return
                }
                resolve(actor)
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

    getActor = (renderSettings: Settings): Promise<Actor> => {
        return new Promise<Actor>((resolve, reject) => {
            const actor = this.pool.shift()
            if (!actor) {
                this.waitingPool.push(resolve)
            } else {
                resolve(actor)
            }
        })
    }

    releaseActor = (actor: Actor) => {
        this.pool.push(actor)
        this.actorAddedBackToPool.Fire()
    }

    cleanup = () => {
        this.pool.forEach(actor => actor.Destroy())
        this.pool = []
    }
}
