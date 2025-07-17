// // const vscode = require('vscode');
// // const cp = require('child_process');
// // const path = require('path');

// // function activate(context) {
// //     const diagnosticCollection = vscode.languages.createDiagnosticCollection("semgrep");

// //     vscode.workspace.onDidSaveTextDocument((document) => {
// //         // Only trigger on Python files
// //         if (document.languageId !== 'python') return;

// //         const filePath = document.fileName;
// //         const mainScript = path.join(__dirname, '../scanner/main.py');
        

// //         // ✅ Use system Python path (you can hardcode yours if needed)
// //         const pythonPath = 'python';  // or hardcode: 'C:\\Users\\Moksha Kothari\\AppData\\Local\\Programs\\Python\\Python310\\python.exe'

// //         const command = `"${pythonPath}" "${mainScript}" "${filePath}"`;
// //         console.log("▶ Running command:", command);

// //         cp.exec(command, (err, stdout, stderr) => {
// //             if (err) {
// //                 vscode.window.showErrorMessage("⚠️ Semgrep Error: " + stderr);
// //                 return;
// //             }

// //             console.log("✅ Raw Semgrep output:", stdout);

// //             let results;
// //             try {
// //                 const parsed = JSON.parse(stdout);
// //                 results = parsed.results || [];
// //             } catch (e) {
// //                 vscode.window.showErrorMessage("❌ Failed to parse Semgrep JSON output.");
// //                 return;
// //             }

// //             const diagnostics = results.map(result => {
// //                 const start = new vscode.Position(result.start.line - 1, result.start.col - 1);
// //                 const end = new vscode.Position(result.end.line - 1, result.end.col - 1);
// //                 const range = new vscode.Range(start, end);

// //                 const severity = result.extra.severity === "ERROR"
// //                     ? vscode.DiagnosticSeverity.Error
// //                     : vscode.DiagnosticSeverity.Warning;

// //                 return new vscode.Diagnostic(range, result.extra.message, severity);
// //             });

// //             // ✅ Show inline and in Problems tab
// //             diagnosticCollection.set(document.uri, diagnostics);
// //             vscode.window.showInformationMessage(`🔍 Semgrep scan: ${diagnostics.length} issue(s) found.`);
// //         });
// //     });

// //     context.subscriptions.push(diagnosticCollection);
// // }

// // function deactivate() {}

// // module.exports = {
// //     activate,
// //     deactivate
// // };

// const vscode = require('vscode');
// const cp = require('child_process');
// const path = require('path');
// const os = require('os');

// function activate(context) {
//     const diagnosticCollection = vscode.languages.createDiagnosticCollection("semgrep");

//     vscode.workspace.onDidSaveTextDocument((document) => {
//         if (document.languageId !== 'python') return;

//         const filePath = document.fileName;

//         // Adjust path to your main.py
//         const mainScript = path.join(__dirname, '../scanner/main.py');

//         // ✅ Use system Python path (or hardcode if needed)
//         const pythonPath = os.platform() === 'win32'
//             ? 'python' // or full path to python.exe if needed
//             : 'python3';

//         const command = `"${pythonPath}" "${mainScript}" "${filePath}"`;
//         console.log("▶ Running Semgrep command:", command);

//         cp.exec(command, (err, stdout, stderr) => {
//             if (err && !stdout) {
//                 vscode.window.showErrorMessage("⚠️ Semgrep failed: " + stderr);
//                 return;
//             }

//             let results;
//             try {
//                 const parsed = JSON.parse(stdout);
//                 results = parsed.results || [];
//             } catch (e) {
//                 vscode.window.showErrorMessage("❌ Failed to parse Semgrep output as JSON.");
//                 return;
//             }

//             const diagnostics = results.map(result => {
//                 const start = new vscode.Position(result.start.line - 1, result.start.col - 1);
//                 const end = new vscode.Position(result.end.line - 1, result.end.col - 1);
//                 const range = new vscode.Range(start, end);

//                 const severity = result.extra.severity === "ERROR"
//                     ? vscode.DiagnosticSeverity.Error
//                     : vscode.DiagnosticSeverity.Warning;

//                 return new vscode.Diagnostic(range, result.extra.message, severity);
//             });

//             diagnosticCollection.set(document.uri, diagnostics);
//             vscode.window.showInformationMessage(`🔍 Semgrep scan: ${diagnostics.length} issue(s) found.`);
//         });
//     });

//     context.subscriptions.push(diagnosticCollection);
// }

// function deactivate() {}

// module.exports = {
//     activate,
//     deactivate
// };

const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');
const os = require('os');

function activate(context) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("semgrep");

    vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId !== 'python') return;

        const filePath = document.fileName;
        const mainScript = path.join(__dirname, '../scanner/main.py');

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

            // ✅ Add fallback diagnostic if Semgrep gave no output (for testing)
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
