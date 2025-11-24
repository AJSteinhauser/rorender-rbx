interface DockWidgetPluginGui {
    Title: string
}
interface StudioService {
    StudioLocaleId: string
    GridSize: number
}
interface _G {
    v4setLanguage: (localeCode: string) => boolean
    v4getCurrentLocale: () => string
    v4Locale?: string
}
