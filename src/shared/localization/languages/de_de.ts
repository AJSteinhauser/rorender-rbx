const translations: Record<string, string> = {
    //start-screen
    CreateSettingsModule: `Einstellungsmodul erstellen`,
    LoadSettingsModule: `Einstellungsmodul laden`,
    NoSettingsModule: `Keine Konfiguration gefunden (im Workspace). Erwägen Sie, ein neues RenderSettings-Modul zu erstellen oder das SettingsModule manuell auszuwählen`,
    LoadSettingsModuleInfo: `Um eine vorherige Konfiguration zu laden, wählen Sie zuerst das Modul im Workspace aus und klicken Sie dann auf "Einstellungsmodul laden"`,

    //rendering-progress-screen
    RenderingImage: `Bild wird gerendert...`,

    //view-finder
    ShowWaterinPreview: `Wasser im Vorschaubild anzeigen`,
    RenderSize: `Bild Größe`,
    RenderSizePlaceholder: `Geben sie eine nummer ein von 100 - 1024`,
    RerenderViewFinder: `Vorschaubild neu laden`,

    //render-runner
    PerformingDataAccumulation: `Datensammlung wird durchgeführt...`,
    CompressingDataRun: `Datenkomprimierung [Run-Length-Encoding]`,
    Time: `Zeit: `,
    Raw: `RAW: %.2f KB`,
    RawPacketsRequired: `Benötigte RAW-Pakete: %d`,
    RLECompression: `RLE-Komprimierung: %.2f%%`,
    RLE: `RLE: %.2f KB`,
    RLEPacketsRequired: `Benötigte RLE-Pakete: %d`,
    CompressingDataHuffman: `Datenkomprimierung [Huffman-Encoding]`,
    HuffmanPlusRLECompression: `Huffman + RLE-Komprimierung: %.2f%%`,
    Huffman: `Huffman: %.2f KB`,
    HuffmanPacketsRequired: `Benötigte Huffman-Pakete: %d`,
    AddingFinalEncodings: `Endgültige Kodierungen werden hinzugefügt...`,
    BitLength: `Bitlänge: `,
    FinalSize: `Endgültige Größe: %.2f KB`,
    FinalPacketsRequired: `Benötigte endgültige Pakete: %d`,
    SendingDataToServer: `Daten werden an RoRender.com gesendet`,
    Sent: `Gesendet: `,
    Size: `Größe: `,
    RenderComplete: `Rendering abgeschlossen...`,

    //render-config-screen
    QuickSelect: `Schnellauswahl`,
    Corner0: `Ecke 0`,
    Corner1: `Ecke 1`,
    SettingsModule: `Einstellungsmodul`,
    AutoConfigure: `Automatisch konfigurieren`,
    Helpers: `Helfer`,
    DraggerModeMovement: `Wechsel zu Skalieren`,
    DraggerModeResize: `Wechsel zu Verschieben`,
    Viewfinder: `Sucher`,
    RenderId: `Render-ID`,
    PasteRenderId: `Fügen Sie die Render-ID hier ein`,
    StartRender: `Rendering starten`,
    InvalidUUID: `%s ist keine gültige UUID. Verwenden Sie die Kopier-Schaltfläche, um sicherzustellen, dass die gesamte UUID in Ihre Zwischenablage kopiert wird.`,
    DetachConfiguration: `Konfiguration trennen`,
    Stats: `Statistiken`,
    OutputImageSize: `Ausgabebildgröße`,
    BoxScale: `Box-Skala`,
    RawData: `Rohdaten`,

    //error-screen
    Error: `Fehler`,
    Ok: `Ok`,

    //advanced-config-screen
    MoveBox: `Box bewegen`,
    Forwards: `Vorwärts`,
    Backwards: `Rückwärts`,
    Left: `Links`,
    Right: `Rechts`,
    MeshDetail: `Mesh-Detail`,
    ConvertMeshCollisionBoxes: `Mesh-Kollisionsboxen konvertieren`,
    Isometric: `Isometrisch`,
    ConvertIsometric: `Isometrisch konvertieren`,
    ExitHelpers: `Helfer Verlassen`
}

export = translations
