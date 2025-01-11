import { Settings } from "shared/settings/settings.model"

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
        this.actorPoolIntialized = true
        this.pool = script.Parent?.Parent?.Parent?.FindFirstChild("actorPool")?.GetChildren() as Actor[]
    }
    getActor = (renderSettings: Settings): Promise<Actor> => {
        if (!this.actorPoolIntialized) {
            this.initializeActors(renderSettings)
        }
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

}
