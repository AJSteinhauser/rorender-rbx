import { useEffect, useState } from "@rbxts/react"
import LocalizationModule from "./localization"
const StudioService = game.GetService("StudioService")

export function useLocalization() {
    // Use a counter to force re-renders when locale changes
    const [localeUpdate, setLocaleUpdate] = useState(0)

    // Get current locale
    const locale = LocalizationModule.getCurrentLocale()

    // Update locale and force re-render
    const updateLocale = (newLocale: string) => {
        if (LocalizationModule.setLanguage(newLocale)) {
            setLocaleUpdate((prev) => prev + 1) // Increment to force re-render
        }
    }

    // Handle StudioLocaleId changes
    useEffect(() => {
        // Initial locale check
        updateLocale(StudioService.StudioLocaleId)

        // Listen for StudioLocaleId changes
        const connection = StudioService.GetPropertyChangedSignal(
            "StudioLocaleId"
        ).Connect(() => {
            updateLocale(StudioService.StudioLocaleId)
        })

        // Cleanup
        return () => connection.Disconnect()
    }, [])

    return {
        locale,
        translate: LocalizationModule.translate,
        setLanguage: (localeCode: string) => {
            localeCode = localeCode.lower()
            const success = LocalizationModule.setLanguage(localeCode)
            if (success) {
                setLocaleUpdate((prev) => prev + 1) // Force re-render
            }
            return success
        }
    }
}
