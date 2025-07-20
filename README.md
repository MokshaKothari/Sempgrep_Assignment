# Secure VS Code Helper - Real-time Security Scanner Extension

A VS Code extension that provides real-time security vulnerability detection for Python code using Semgrep static analysis. This extension automatically scans your Python files for security issues as you save them, providing immediate feedback directly in your IDE.

## Features

- **Real-time Security Scanning**: Automatically scans Python files on save
- **Custom Security Rules**: YAML-based rule definitions for extensible security checks
- **Inline Diagnostics**: Security issues displayed as squiggly lines in the editor
- **Problems Panel Integration**: All security findings aggregated in VS Code's Problems panel
- **Cross-platform Support**: Works on Windows, Linux, and macOS
- **Zero Configuration**: Works out of the box with workspace detection

## Security Vulnerabilities Detected

### Currently Supported:
- **Hardcoded Secrets**: API keys, tokens, passwords in source code
- **Missing Authorization**: Flask routes without authentication checks

## Prerequisites

Before using this extension, ensure you have:

1. **Python** installed on your system
2. **Semgrep** static analysis tool:
   ```bash
   pip install semgrep
   ```
3. **VS Code** version 1.70.0 or higher

## Project Structure

```
semgrep_assignm/
├── client/                          # VS Code Extension
│   ├── extension.js                 # Main extension logic
│   ├── package.json                 # Extension manifest
│   └── secure-vscode-helper-1.0.0.vsix  # Packaged extension
├── scanner/                         # Python Security Scanner
│   ├── main.py                      # Scanner entry point
│   ├── semgrep_rules/              # Custom security rules
│   │   ├── hardcoded_secrets.yaml  # Secrets detection rules
│   │   └── missing_auth.yaml       # Authorization check rules
│   └── test_files/                 # Test files with vulnerabilities
│       ├── hardcoded_secrets.py    # Example hardcoded secrets
│       └── missing_auth.py         # Example missing auth
├── .vscode/                        # VS Code workspace settings
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

## Usage

### Automatic Scanning

1. Open a Python workspace in VS Code
2. Ensure the scanner is located at `<workspace>/scanner/main.py`
3. Edit and save any Python file
4. Security issues will appear as:
   - **Red squiggly lines** for ERROR-level issues
   - **Yellow squiggly lines** for WARNING-level issues
   - **Entries in Problems panel** (Ctrl+Shift+M)
   - **Toast notifications** with scan results

### Manual Scanning

Use the Command Palette (Ctrl+Shift+P) and run:
- `Run Semgrep Security Scan`

### Supported Severity Levels

- `ERROR`: Red squiggly lines, high priority
- `WARNING`: Yellow squiggly lines, medium priority
- `INFO`: Blue squiggly lines, low priority
