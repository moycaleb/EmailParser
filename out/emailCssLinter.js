"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailCssLinter = void 0;
const vscode = require("vscode");
const vscode_css_languageservice_1 = require("vscode-css-languageservice");
class EmailCssLinter {
    constructor() {
        this.cssService = (0, vscode_css_languageservice_1.getCSSLanguageService)();
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('email-css-linter');
    }
    async validateDocument(document) {
        if (document.languageId !== 'css' && document.languageId !== 'html') {
            return;
        }
        const cssText = this.extractCssFromDocument(document);
        if (!cssText)
            return;
        const textDocument = vscode_css_languageservice_1.TextDocument.create(document.uri.toString(), 'css', document.version, cssText);
        const stylesheet = this.cssService.parseStylesheet(textDocument);
        const diagnostics = this.cssService.doValidation(textDocument, stylesheet);
        console.log(`Email CSS Linter: Found ${diagnostics.length} diagnostics for ${document.fileName}`);
        // Filter out email-specific errors
        const filteredDiagnostics = diagnostics.filter(diagnostic => {
            const line = textDocument.getText().split('\n')[diagnostic.range.start.line];
            // Allow .& selectors
            if (diagnostic.message.includes('identifier expected') && line.includes('.&')) {
                console.log(`Email CSS Linter: Filtered out .& error: ${diagnostic.message}`);
                return false;
            }
            return true;
        });
        console.log(`Email CSS Linter: Showing ${filteredDiagnostics.length} diagnostics after filtering`);
        // Convert to VSCode diagnostics
        const vscodeDiagnostics = filteredDiagnostics.map(d => {
            const diagnostic = new vscode.Diagnostic(new vscode.Range(d.range.start.line, d.range.start.character, d.range.end.line, d.range.end.character), d.message, this.mapSeverity(d.severity));
            diagnostic.source = 'email-css-linter';
            return diagnostic;
        });
        this.diagnosticCollection.set(document.uri, vscodeDiagnostics);
    }
    extractCssFromDocument(document) {
        if (document.languageId === 'css') {
            return document.getText();
        }
        if (document.languageId === 'html') {
            const text = document.getText();
            const styleMatches = text.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
            return styleMatches ? styleMatches.map(match => match.replace(/<\/?style[^>]*>/gi, '')).join('\n') : null;
        }
        return null;
    }
    mapSeverity(severity) {
        switch (severity) {
            case 1: return vscode.DiagnosticSeverity.Error;
            case 2: return vscode.DiagnosticSeverity.Warning;
            case 3: return vscode.DiagnosticSeverity.Information;
            case 4: return vscode.DiagnosticSeverity.Hint;
            default: return vscode.DiagnosticSeverity.Error;
        }
    }
    dispose() {
        this.diagnosticCollection.dispose();
    }
}
exports.EmailCssLinter = EmailCssLinter;
//# sourceMappingURL=emailCssLinter.js.map