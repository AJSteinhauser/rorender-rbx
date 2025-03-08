import { FeatureFlagSchema } from "./fflags.model"

const localFlags: FeatureFlagSchema = {
    version: "1.0.0",
    featureFlags: {
        earlyRelease: {
            localPluginActive: {
                description:
                    "Due to engine-related bugs involving RunContext: Plugin and Actor:SendMessage, this plugin is currently limited to functioning locally. This flag will disable the locally installed version of the plugin, encouraging users to transition to the Roblox Plugin Manager version. The Plugin Manager version offers enhanced security permissions and a built-in update management system for a more reliable and secure experience.",
                enabled: true,
                environmentOverrides: {
                    development: true,
                    production: true
                },
                createdAt: "Sat Mar  1 08:23:14 EST 2025"
            }
        }
    }
}

export default localFlags
