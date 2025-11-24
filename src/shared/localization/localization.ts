const StudioService = game.GetService("StudioService")

interface LanguageDictionary {
    [key: string]: string
}

let currentLocale: string = StudioService.StudioLocaleId.lower()
const defaultLocale = "en_us"
const languageModules: Map<string, LanguageDictionary> = new Map()
const languagesFolder = script.Parent?.FindFirstChild("languages") as
    | Folder
    | undefined

function loadLanguageModule(locale: string): LanguageDictionary | undefined {
    locale = locale.lower()
    if (!languagesFolder) {
        print("Languages folder not found")
        return undefined
    }
    const module = languagesFolder.FindFirstChild(locale)
    if (module) {
        const [success, result] = pcall(() => {
            return require(module as ModuleScript) as LanguageDictionary
        })
        if (success && result) {
            return result
        }
        print(`Failed to load language module for: ${locale}`)
    }
    return undefined
}

function getLanguageModule(locale: string): LanguageDictionary | undefined {
    locale = locale.lower()
    if (!languageModules.has(locale)) {
        const module = loadLanguageModule(locale)
        languageModules.set(locale, module as LanguageDictionary)
    }
    return languageModules.get(locale)
}

function getCurrentLocale() {
    return currentLocale
}

function translate(source: string) {
    const langModule = getLanguageModule(_G.v4Locale || currentLocale)
    if (langModule && langModule[source]) {
        return langModule[source]
    }

    if (currentLocale !== defaultLocale) {
        const defaultModule = getLanguageModule(defaultLocale)
        if (defaultModule && defaultModule[source]) {
            return defaultModule[source]
        }
    }

    return source
}

function setLanguage(localeCode: string) {
    localeCode = localeCode.lower()
    if (getLanguageModule(localeCode)) {
        currentLocale = localeCode
        return true
    }
    if (localeCode === defaultLocale) {
        currentLocale = localeCode
        return true
    }
    return false
}

;(function () {
    getLanguageModule(defaultLocale)
    getLanguageModule(StudioService.StudioLocaleId)
    if (languageModules.has(StudioService.StudioLocaleId)) {
        currentLocale = StudioService.StudioLocaleId.lower()
    }
    _G.v4setLanguage = setLanguage
    _G.v4getCurrentLocale = getCurrentLocale
})()

export = {
    getCurrentLocale: getCurrentLocale,
    setLanguage: setLanguage,
    translate: translate
}
