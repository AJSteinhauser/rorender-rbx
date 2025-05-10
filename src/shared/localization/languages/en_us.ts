const translations: Record<string, string> = {
    //start-screen
    CreateSettingsModule: `Create Settings Module`,
    LoadSettingsModule: `Load Settings Module`,
    NoSettingsModule: `No configuration found (in the workspace). Consider creating a new RenderSettings Module or manually selecting the SettingsModule`,
    LoadSettingsModuleInfo: `To load a previous configuration, select the module in the workspace first, then click "Load Settings Module"`,

    //rendering-progress-screen
    RenderingImage: `Rendering Image...`,

    //view-finder
    ShowWaterinPreview: `Show Water in Preview`,

    //render-runner
    PerformingDataAccumulation: `Performing Data Accumulation...`,
    CompressingDataRun: `Compressing Data [Run Length Encoding]`,
    Time: `Time: `,
    Raw: `RAW: %.2f KB`,
    RawPacketsRequired: `RAW Packets Required: %d`,
    RLECompression: `RLE compression: %.2f%%`,
    RLE: `RLE: %2.f KB`,
    RLEPacketsRequired: `RLE Packets Required: %d`,
    CompressingDataHuffman: `Compressing Data [Huffman Encoding]`,
    HuffmanPlusRLECompression: `Huffman + RLE compression: %.2f%%`,
    Huffman: `Huffman: %2.f KB`,
    HuffmanPacketsRequired: `Huffman Packets Required: %d`,
    AddingFinalEncodings: `Adding Final Encodings...`,
    BitLength: `bit length: `,
    FinalSize: `Final Size : %2.f KB`,
    FinalPacketsRequired: `Final Packets Required: %d`,
    SendingDataToServer: `Sending Data to RoRender.com`,
    Sent: `sent: `,
    Size: `size: `,
    RenderComplete: `Render Complete...`,

    //render-config-screen
    QuickSelect: `Quick Select`,
    Corner0: `Corner 0`,
    Corner1: `Corner 1`,
    SettingsModule: `Settings Module`,
    AutoConfigure: `Auto Configure`,
    Helpers: `Helpers`,
    Viewfinder: `Viewfinder`,
    RenderId: `Render Id`,
    PasteRenderId: `Paste the render id here`,
    StartRender: `Start Render`,
    InvalidUUID: `%s is not a valid UUID. Use the copy button to ensure the entire UUID is copied into your clipboard.`,
    DetachConfiguration: `Detach Configuration`,
    Stats: `Stats`,
    OutputImageSize: `Output Image Size`,
    BoxScale: `Box Scale`,
    RawData: `Raw Data`,

    //error-screen
    Error: `Error`,
    Ok: `Ok`,

    //advanced-config-screen
    MoveBox: `Move Box`,
    Forwards: `Forwards`,
    Backwards: `Backwards`,
    Left: `Left`,
    Right: `Right`,
    MeshDetail: `Mesh Detail`,
    ConvertMeshCollisionBoxes: `Convert Mesh Collision Boxs`,
    Isometric: `Isometric`,
    ConvertIsometric: `Convert Isometric`,
    ExitHelpers: `Exit Helpers`
}

export = translations
