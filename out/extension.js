"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const emailCssLinter_1 = require("./emailCssLinter");
function activate(context) {
    const emailCssLinter = new emailCssLinter_1.EmailCssLinter();
    // Suppress built-in CSS diagnostics
    const suppressBuiltinDiagnostics = vscode.languages.onDidChangeDiagnostics((e) => {
        e.uris.forEach(async (uri) => {
            const diagnostics = vscode.languages.getDiagnostics(uri);
            const cssErrors = diagnostics.filter(d => d.source === 'css' || d.source === 'html');
            if (cssErrors.length > 0) {
                try {
                    const doc = await vscode.workspace.openTextDocument(uri);
                    if (doc.languageId === 'html' || doc.languageId === 'css') {
                        // Clear all built-in CSS/HTML diagnostics
                        const emptyCollection = vscode.languages.createDiagnosticCollection('builtin-override');
                        emptyCollection.set(uri, []);
                        context.subscriptions.push(emptyCollection);
                    }
                }
                catch (error) {
                    // Ignore file access errors
                }
            }
        });
    });
    // Validate on document change
    const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument((event) => {
        emailCssLinter.validateDocument(event.document);
    });
    // Validate on document open
    const onDidOpenTextDocument = vscode.workspace.onDidOpenTextDocument((document) => {
        emailCssLinter.validateDocument(document);
    });
    // Validate all open documents on activation
    vscode.workspace.textDocuments.forEach(document => {
        emailCssLinter.validateDocument(document);
    });
    // Register completion provider for email CSS
    const cssProvider = vscode.languages.registerCompletionItemProvider(['css', 'html'], {
        provideCompletionItems(document, position) {
            const completions = [];
            // Add .& selector completion
            const yahooHack = new vscode.CompletionItem('.& ', vscode.CompletionItemKind.Snippet);
            yahooHack.detail = 'Yahoo mail selector hack';
            yahooHack.documentation = 'Targets Yahoo mail clients specifically';
            yahooHack.insertText = new vscode.SnippetString('.& ${1:.class-name}');
            completions.push(yahooHack);
            // Add Outlook-specific selectors
            const outlookClass = new vscode.CompletionItem('[class*=""]', vscode.CompletionItemKind.Snippet);
            outlookClass.detail = 'Outlook class selector';
            outlookClass.insertText = new vscode.SnippetString('[class*="${1:class-name}"]');
            completions.push(outlookClass);
            return completions;
        }
    }, '.' // Trigger on dot
    );
    // Register hover provider for email-specific patterns
    const hoverProvider = vscode.languages.registerHoverProvider(['css', 'html'], {
        provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position, /\.&\s/);
            if (range) {
                const text = document.getText(range);
                if (text.startsWith('.&')) {
                    return new vscode.Hover([
                        '**Yahoo Mail Selector Hack**',
                        'This selector targets Yahoo mail clients specifically.',
                        'The `.&` prefix is a hack that works around Yahoo\'s CSS parsing.'
                    ]);
                }
            }
            return null;
        }
    });
    context.subscriptions.push(cssProvider, hoverProvider, onDidChangeTextDocument, onDidOpenTextDocument, suppressBuiltinDiagnostics, emailCssLinter);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map