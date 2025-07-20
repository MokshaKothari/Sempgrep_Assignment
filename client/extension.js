const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

function activate(context) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("semgrep");

    vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId !== 'python') return;

        const filePath = document.fileName;
        
        // Look for scanner in workspace root
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
        if (!workspaceRoot) {
            vscode.window.showErrorMessage("No workspace folder found");
            return;
        }
        
        const mainScript = path.join(workspaceRoot, 'scanner', 'main.py');
        
        // Check if scanner exists
        const fs = require('fs');
        if (!fs.existsSync(mainScript)) {
            vscode.window.showErrorMessage(`Scanner not found at: ${mainScript}`);
            return;
        }

        const pythonPath = os.platform() === 'win32' ? 'python' : 'python3';
        const command = `"${pythonPath}" "${mainScript}" "${filePath}"`;

        console.log("Running Semgrep command:", command);

        cp.exec(command, (err, stdout, stderr) => {
            if (err && !stdout) {
                vscode.window.showErrorMessage("Semgrep failed: " + stderr);
                return;
            }

            let results;
            try {
                const parsed = JSON.parse(stdout);
                results = parsed.results || [];
            } catch (e) {
                vscode.window.showErrorMessage("Failed to parse Semgrep output as JSON.");
                return;
            }

            const diagnostics = results.map(result => {
                const start = new vscode.Position(result.start.line - 1, result.start.col - 1);
                const end = new vscode.Position(result.end.line - 1, result.end.col - 1);
                const range = new vscode.Range(start, end);

                const severity = result.extra.severity === "ERROR"
                    ? vscode.DiagnosticSeverity.Error
                    : vscode.DiagnosticSeverity.Warning;

                return new vscode.Diagnostic(range, result.extra.message, severity);
            });

            // fallback diagnostic if Semgrep gave no output
            if (diagnostics.length === 0) {
                const fallbackRange = new vscode.Range(0, 0, 0, 10);
                diagnostics.push(new vscode.Diagnostic(
                    fallbackRange,
                    "Test: No Semgrep issues found, fallback message.",
                    vscode.DiagnosticSeverity.Information
                ));
            }

            diagnosticCollection.set(document.uri, diagnostics);
            vscode.window.showInformationMessage(`Semgrep scan: ${diagnostics.length} issue(s) reported.`);
        });
    });

    context.subscriptions.push(diagnosticCollection);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
