import { act } from "@rbxts/react-roblox"
import { Settings } from "shared/settings/settings.model"

const threads = script.Parent?.Parent?.Parent?.FindFirstChild("threads") as Folder

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
        const preInstantiatedActors = threads.GetChildren().filter(x => x.IsA("Actor"))
        for (let i = 0; i < math.min(renderSettings.actors,preInstantiatedActors.size()) ; i++) {
            this.pool.push(preInstantiatedActors[i] as Actor)
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
        //this.pool.forEach(actor => actor.Destroy())
        this.pool = []
    }
}
