const translations: Record<string, string> = {
    //start-screen
    CreateSettingsModule: `Criando módulo de configurações`,
    LoadSettingsModule: `Carregando módulo de configurações`,
    NoSettingsModule: `Nenhuma configuração salva no workspace. Considere criar uma nova configuração pelo plugin ou manualmente`,
    LoadSettingsModuleInfo: `Para carregar uma configuração salva, selecione o módulo no workspace e clique em "Load Settings Module"`,

    //rendering-progress-screen
    RenderingImage: `Renderizando imagem...`,

    //view-finder
    ShowWaterinPreview: `Mostrar água na prévia`,

    //render-runner
    PerformingDataAccumulation: `Realizando acumulação de dados...`,
    CompressingDataRun: `Compactando dados [Rodando Codificação de Comprimento]`,
    Time: `Tempo: `,
    Raw: `RAW: %.2f KB`,
    RawPacketsRequired: `Pacotes RAW necessários: %d`,
    RLECompression: `Compressão RLE: %.2f%%`,
    RLE: `RLE: %2.f KB`,
    RLEPacketsRequired: `Pacotes RLE necessários: %d`,
    CompressingDataHuffman: `Compactando dados [Huffman Codificação]`,
    HuffmanPlusRLECompression: `Compressão Huffman + RLE: %.2f%%`,
    Huffman: `Huffman: %2.f KB`,
    HuffmanPacketsRequired: `Pacotes Huffman necessários: %d`,
    AddingFinalEncodings: `Adicionando codificações finais...`,
    BitLength: `Tamanho em bits: `,
    FinalSize: `Tamanho final: %2.f KB`,
    FinalPacketsRequired: `Pacotes finais necessários: %d`,
    SendingDataToServer: `Enviando dados para RoRender.com`,
    Sent: `enviado: `,
    Size: `tamanho: `,
    RenderComplete: `Renderização completa...`,

    //render-config-screen
    QuickSelect: `Seleção rápida`,
    Corner0: `Canto 0`,
    Corner1: `Canto 1`,
    SettingsModule: `Módulo de Configurações`,
    AutoConfigure: `Auto Configurar`,
    Helpers: `Auxiliares`,
    Viewfinder: `Visor`,
    RenderId: `ID do Render`,
    PasteRenderId: `Cole o ID do render aqui`,
    StartRender: `Iniciar Render`,
    InvalidUUID: `%s não é um UUID válido. Use o botão de copiar para garantir que o UUID completo seja copiado para sua área de transferência.`,
    DetachConfiguration: `Desanexar Configuração`,
    Stats: `Estatísticas`,
    OutputImageSize: `Tamanho da Imagem`,
    BoxScale: `Escala da Caixa`,
    RawData: `Dados Brutos`,

    //error-screen
    Error: `Erro`,
    Ok: `Ok`,

    //advanced-config-screen
    MoveBox: `Mover Caixa`,
    Forwards: `Para Frente`,
    Backwards: `Para Trás`,
    Left: `Esquerda`,
    Right: `Direita`,
    MeshDetail: `Detalhe da Malha`,
    ConvertMeshCollisionBoxes: `Converter Caixas de Colisão da Malha`,
    Isometric: `Isométrico`,
    ConvertIsometric: `Converter para Isométrico`,
    ExitHelpers: `Sair dos Auxiliares`
}

export = translations
