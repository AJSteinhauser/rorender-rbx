interface DockWidgetPluginGui {
    Title: string
}
interface StudioService {
    GridSize: number
    StudioLocaleId: string
}
interface _G {
    v4setLanguage: (localeCode: string) => boolean
    updateViewfinderSize: (size: Vector2) => void
}
