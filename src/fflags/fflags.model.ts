export type Environment = "development" | "production"

type EnvironmentOverrides = {
    [key in Environment]?: boolean // Optional overrides for each environment
}

type FeatureFlag = {
    description: string // Brief explanation of the feature flag
    enabled: boolean // Default state of the feature flag
    environmentOverrides?: EnvironmentOverrides // Environment-specific overrides
    createdAt: string // ISO timestamp for when the flag was created
    deprecated?: boolean // Optional field to mark the flag as deprecated
}

type FeatureFlagCategory = {
    [flagName: string]: FeatureFlag // A collection of feature flags within a category
}

export type FeatureFlagSchema = {
    featureFlags: {
        [categoryName: string]: FeatureFlagCategory // Categories of feature flags
    }
    version: string // Version of the schema
}

export interface LocalCacheFeatureFlags {
    createdAt: number // tick()
    fflags: FeatureFlagSchema
}
