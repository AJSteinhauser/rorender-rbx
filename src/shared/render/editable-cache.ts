
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

export function getEditableMesh(meshId: string): EditableMesh {
    return getEditableFromId(meshId, meshCacheStore, getEditableMeshFromRoblox)
}

export function getEditableImage(imageId: string): EditableImage {
    return getEditableFromId(imageId, imageCacheStore, getEditableImageFromRoblox)
}

function createContentFromID(assetId: string): Content { 
    return Content.fromUri("rbxassetid://" + assetId)
}

function getEditableMeshFromRoblox(assetId: string): EditableMesh {
    return ASSET_SERVICE.CreateEditableMeshAsync(createContentFromID(assetId))
}

function getEditableImageFromRoblox(assetId: string): EditableImage {
    return ASSET_SERVICE.CreateEditableImageAsync(createContentFromID(assetId))
}

function getEditableFromId<T extends EditableClass>(
    assetId: string,
    assetCache: EditableCacheStore<T>,
    generateAsset: (assetId: string) => T
): T {
    const editableCache = assetCache.get(assetId)
    const assetDoesNotExistsAndRetryLimitNotHit = (editableCache && !editableCache.object && editableCache.creationAttempts <= MAX_CREATE_ATTEMPTS)
    if (editableCache?.object){
        return editableCache.object
    }
    if (!editableCache || assetDoesNotExistsAndRetryLimitNotHit) {
        const creationAttempts = ((editableCache && editableCache.creationAttempts) || 0) 
        try {
            const asset = generateAsset(assetId)
            assetCache.set(assetId,{
                object: asset,
                creationAttempts: creationAttempts + 1
            })
            return asset
        }
        catch (e) {
            assetCache.set(assetId, {object: undefined, creationAttempts: creationAttempts + 1})
            print(e)
            throw "Failed to get mesh " + tostring(e)
        }
    }
    throw `Failed to get mesh... ${MAX_CREATE_ATTEMPTS} attempts`
}
