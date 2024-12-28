"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiagnosticWithLocation = createDiagnosticWithLocation;
function createDiagnosticWithLocation(id, messageText, category, node) {
    const code = " roblox-ts";
    if ("kind" in node) {
        return {
            category,
            code,
            messageText,
            id,
            file: node.getSourceFile(),
            start: node.getStart(),
            length: node.getWidth(),
        };
    }
    else {
        return {
            category,
            code,
            messageText,
            id,
            file: node.sourceFile,
            start: node.range.pos,
            length: node.range.end,
        };
    }
}
//# sourceMappingURL=createDiagnosticWithLocation.js.map