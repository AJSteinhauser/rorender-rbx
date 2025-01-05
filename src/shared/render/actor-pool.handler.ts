import { Settings } from "shared/settings/settings.model"

const templateActor = script.Parent?.Parent?.Parent?.FindFirstChild("actor") as Actor
if (!templateActor) {
    throw "TemplateActor not found"
}

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
        for (let i = 0; i < renderSettings.actorCount; i++) {
            const actor = templateActor.Clone()
            actor.Name = `actor-${i}`
            actor.Parent = game.GetService("ServerScriptService")
            this.pool.push(actor)
        }
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

    cleanupActor = (actor: Actor) => {
        this.pool.push(actor)
        this.actorAddedBackToPool.Fire()
    }

}




