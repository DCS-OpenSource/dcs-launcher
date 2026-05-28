import * as vscode from "vscode";

export class ControlsView implements vscode.WebviewViewProvider {

    public static readonly viewType = "dcsLauncher.controls";

    constructor(private readonly extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getHtml();

        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case "launch":
                    vscode.commands.executeCommand("dcsLauncher.launchStandalone");
                    break;

                case "launchMulticrew":
                    vscode.commands.executeCommand("dcsLauncher.launchMulticrew");
                    break;

                case "kill":
                    vscode.commands.executeCommand("dcsLauncher.killDcs");
                    break;
            }
        });
    }

    private getHtml(): string {
        return `
        <!DOCTYPE html>
        <html>
        <body style="
            margin: 0;
            padding: 6px 8px;
            font-family: var(--vscode-font-family);
        ">

            <button id="launch"
                style="
                    width: 100%;
                    padding: 6px 8px;
                    background-color: #16a34a;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    margin-bottom: 6px;
                ">
                Launch DCS
            </button>

            <button id="launchMulticrew"
                style="
                    width: 100%;
                    padding: 6px 8px;
                    background-color: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    margin-bottom: 6px;
                ">
                Launch Multicrew Test Client
            </button>

            <button id="kill"
                style="
                    width: 100%;
                    padding: 6px 8px;
                    background-color: #c42b1c;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                ">
                Kill DCS
            </button>

            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById("launch").addEventListener("click", () => {
                    vscode.postMessage({ command: "launch" });
                });

                document.getElementById("launchMulticrew").addEventListener("click", () => {
                    vscode.postMessage({ command: "launchMulticrew" });
                });

                document.getElementById("kill").addEventListener("click", () => {
                    vscode.postMessage({ command: "kill" });
                });
            </script>

        </body>
        </html>
        `;
    }
}
