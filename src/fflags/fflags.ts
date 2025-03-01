import { env, useLocalFFlags } from '../buildConfig'
import localFlags from './fflag-local'
import { FeatureFlagSchema, LocalCacheFeatureFlags } from './fflags.model'
const httpService = game.GetService("HttpService")

const CACHE_FLAG_EXPIRATION =  1 //60 * 60 * 2 // 2 hours

let fflags: FeatureFlagSchema | undefined = undefined

export const getFFlagStatus = (categoryName: string, flagName: string): boolean => {
    if (!fflags){
        fflags = getFFlags()
    }
    const flagArea = fflags.featureFlags[categoryName][flagName]
    let output = flagArea.enabled
    if (flagArea.environmentOverrides) {
        if (flagArea.environmentOverrides[env]) {
            output = flagArea.environmentOverrides[env]
        }
    }
    return output    
}

export const getFFlags = () :FeatureFlagSchema => {
    let localFeatureFlags: FeatureFlagSchema = localFlags
    let usingLocalFFlags = useLocalFFlags

    let fflags: FeatureFlagSchema

    if (usingLocalFFlags) {
        fflags = localFeatureFlags
    }
    else {
        try {
            const getFlags = getHostedSettings()
            if (!getFlags) {
                warn("Local fflag has not been modified from testing state, reverting to prod fflags")
                fflags = localFeatureFlags
            }
            else {
                fflags = getFlags
            }
        }
        catch {
            fflags = localFeatureFlags
            warn("There was a problem retrieving hosted fflags, reverting to local flags")
        }
    }
    return fflags
}

const getHostedSettings = (): FeatureFlagSchema | undefined => {
    const localSettings = plugin.GetSetting('cache-fflag') as LocalCacheFeatureFlags
    print(localSettings)
    if (localSettings && tick() - localSettings.createdAt < CACHE_FLAG_EXPIRATION ) {
        return localSettings.fflags
    }
    const response = httpService.GetAsync('https://raw.githubusercontent.com/AJSteinhauser/rorender-rbx/refs/heads/main/fflags.json')
    const formattedFlags = httpService.JSONDecode(response) as FeatureFlagSchema

    const newCachedFlags: LocalCacheFeatureFlags = {
        createdAt: tick(),
        fflags: formattedFlags
    }

    plugin.SetSetting('cache-fflag', newCachedFlags)

    return formattedFlags
}


