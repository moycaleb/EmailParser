# Email CSS/HTML Parser Extension

A VSCode extension that provides intelligent CSS and HTML parsing specifically designed for email development. It supports email-specific CSS hacks while maintaining full CSS validation for legitimate errors.

## Features

- **Custom CSS Linter**: Full CSS validation using VSCode's CSS language service with email-specific exceptions
- **Yahoo Mail `.&` Selector Support**: Syntax highlighting, autocomplete, and validation support for `.& .class-name` selectors
- **Built-in Validation Override**: Automatically suppresses VSCode's built-in CSS validation that conflicts with email CSS
- **Email-specific Completions**: Autocomplete for common email CSS patterns and Outlook selectors
- **Hover Documentation**: Explanations for email-specific CSS hacks
- **Works on All Files**: Supports both `.css` and `.html` files (extracts CSS from `<style>` tags)

## Usage

### Basic Usage
1. Install and activate the extension
2. Open any `.html` or `.css` file containing email CSS
3. The extension automatically provides validation and IntelliSense
4. Type `.` in CSS to see email-specific completions
5. Hover over `.&` selectors for documentation

### Email CSS Patterns Supported
- `.& .class-name` - Yahoo mail selector hack (space required after `.&`)
- `[class*="name"]` - Outlook class attribute selectors
- Standard CSS with email-specific validation exceptions

### Example
```css
@media screen and (max-width: 600px) {
  .& .mobile-hide { display: none !important; }
  .& .mobile-show { display: block !important; }
}
```

## Installation

### Development
1. Clone this repository
2. Run `npm install`
3. Compile: `npm run compile`
4. Press F5 to test in Extension Development Host

### Production
1. Package: `vsce package`
2. Install the generated `.vsix` file in VSCode

## Configuration

The extension works best with these workspace settings (automatically applied):

```json
{
  "css.validate": false,
  "html.validate.styles": false
}
```

This disables VSCode's built-in CSS validation, allowing the extension's custom linter to handle all validation.

## How It Works

### Technical Architecture

The extension uses a multi-layered approach to provide email-aware CSS validation:

#### 1. Built-in Validation Suppression
- Monitors VSCode's diagnostic events using `onDidChangeDiagnostics`
- Actively suppresses built-in CSS validation errors from VSCode's native CSS language service
- Creates empty diagnostic collections to override conflicting diagnostics

#### 2. Custom CSS Language Service
- Uses Microsoft's `vscode-css-languageservice` (the same library that powers VSCode's CSS support)
- Implements a custom `EmailCssLinter` class that:
  - Parses CSS from both `.css` files and `<style>` tags in HTML
  - Runs full CSS validation using the official CSS language service
  - Filters out specific errors that are valid in email CSS context

#### 3. Email-Specific Error Filtering
```typescript
const filteredDiagnostics = diagnostics.filter(diagnostic => {
    const line = textDocument.getText().split('\n')[diagnostic.range.start.line];
    
    // Allow .& selectors
    if (diagnostic.message.includes('identifier expected') && line.includes('.&')) {
        return false; // Suppress this error
    }
    
    return true; // Keep other errors
});
```

#### 4. Syntax Highlighting Enhancement
- Uses TextMate grammar injection to provide proper syntax highlighting for `.&` selectors
- Injects email-specific patterns into VSCode's existing CSS grammar
- Maintains full compatibility with standard CSS highlighting

#### 5. IntelliSense Integration
- Registers completion providers for CSS and HTML contexts
- Provides email-specific snippets and completions
- Includes hover providers for documentation on email CSS hacks

### File Processing Flow

1. **Document Change Detection**: Extension monitors `onDidChangeTextDocument` and `onDidOpenTextDocument`
2. **CSS Extraction**: For HTML files, extracts CSS content from `<style>` tags
3. **Language Service Processing**: Creates TextMate document and parses with CSS language service
4. **Validation**: Runs full CSS validation using Microsoft's CSS language service
5. **Filtering**: Removes email-specific false positives while preserving legitimate errors
6. **Diagnostic Publishing**: Publishes filtered diagnostics to VSCode's Problems panel

### Email CSS Patterns Recognized

- **Yahoo Selectors**: `.& .class-name` patterns with proper spacing
- **Outlook Hacks**: `[class*="name"]` attribute selectors
- **Media Query Hacks**: Email-specific media queries
- **Vendor Prefixes**: Email client specific CSS properties

### Performance Considerations

- Validation runs asynchronously to avoid blocking the UI
- CSS extraction from HTML is optimized with regex parsing
- Diagnostic filtering is performed in-memory for speed
- Extension only processes CSS and HTML files to minimize overhead

## Troubleshooting

### Still seeing `.&` errors?
1. Ensure workspace settings disable built-in CSS validation
2. Reload VSCode window: `Cmd+Shift+P` → "Developer: Reload Window"
3. Check Developer Console for extension logs

### No validation at all?
1. Verify the extension is active in the Extensions panel
2. Check that files are recognized as CSS or HTML
3. Look for error messages in the Developer Console

### Debug Mode
The extension includes console logging. Open Developer Tools (`Help → Toggle Developer Tools`) to see validation activity:
```
Email CSS Linter: Found 3 diagnostics for file.html
Email CSS Linter: Filtered out .& error: identifier expected
Email CSS Linter: Showing 2 diagnostics after filtering
```