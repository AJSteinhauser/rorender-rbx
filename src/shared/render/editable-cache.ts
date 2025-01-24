
const MAX_CREATE_ATTEMPTS = 3
const ASSET_SERVICE = game.GetService("AssetService")

type EditableClass = EditableImage | EditableMesh

interface EditableCacheEntity<T extends EditableClass> {
    object: T | undefined
    creationAttempts: number
}

type EditableCacheStore<T extends EditableClass> = Map<string, EditableCacheEntity<T>>

const meshCacheStore: EditableCacheStore<EditableMesh> = new Map<string, EditableCacheEntity<EditableMesh>>()
const imageCacheStore: EditableCacheStore<EditableImage> = new Map<string, EditableCacheEntity<EditableImage>>()

export async function getEditableMesh(meshId: string): Promise<EditableMesh> {
    return await getEditableFromId(meshId, meshCacheStore, getEditableMeshFromRoblox)
}

export async function getEditableImage(imageId: string): Promise<EditableImage> {
    return await getEditableFromId(imageId, imageCacheStore, getEditableImageFromRoblox)
}

function getEditableMeshFromRoblox(assetId: string): Promise<EditableMesh> {
    return new Promise<EditableMesh>((success,failed) => {
        try {
            const mesh = ASSET_SERVICE.CreateEditableMeshAsync(assetId)
            success(mesh)
        }
        catch {
            failed("Something went wrong when fetching mesh from Roblox.com")
        }
    })
}

function getEditableImageFromRoblox(assetId: string): Promise<EditableImage> {
    return new Promise<EditableImage>((success,failed) => {
        try {
            const image = ASSET_SERVICE.CreateEditableImageAsync(assetId)
            success(image)
        }
        catch {
            failed("Something went wrong when fetching image from Roblox.com")
        }
    })
}

async function getEditableFromId<T extends EditableClass>(
    assetId: string,
    assetCache: EditableCacheStore<T>,
    generateAsset: (assetId: string) => Promise<T>
): Promise<T> {
    const editableCache = assetCache.get(assetId)
    const assetDoesNotExistsAndRetryLimitNotHit = (editableCache && !editableCache.object && editableCache.creationAttempts < MAX_CREATE_ATTEMPTS)
    if (!editableCache || assetDoesNotExistsAndRetryLimitNotHit) {
        const creationAttempts = ((editableCache && editableCache.creationAttempts) || 0) 
        try {
            const asset = await generateAsset(assetId)
            assetCache.set(assetId,{
                object: asset,
                creationAttempts: creationAttempts + 1
            })
            return asset
        }
        catch {
            assetCache.set(assetId, {object: undefined, creationAttempts: creationAttempts + 1})
            throw "Failed to get mesh"
        }
    }
    throw `Failed to get mesh... ${MAX_CREATE_ATTEMPTS} attempts`
}
