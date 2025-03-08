import { Environment, FeatureFlagSchema } from "fflags/fflags.model"

// This value will be changed to production when running npm run build:prod
export const env: Environment = 'production'

// This value will be changed to false when running npm run build:prod
export const useLocalFFlags = false
