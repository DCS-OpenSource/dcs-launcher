import * as vscode from "vscode";
import * as fs from "fs";

export class ControlsView implements vscode.WebviewViewProvider {

    public static readonly viewType = "dcsLauncher.controls";
    private webviewView?: vscode.WebviewView;

    constructor(private readonly extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this.webviewView = webviewView;

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

                case "selectDcsExe":
                    vscode.commands.executeCommand("dcsLauncher.selectDcsExe");
                    break;

                case "selectModelViewerExe":
                    vscode.commands.executeCommand("dcsLauncher.selectModelViewerExe");
                    break;

                case "launchModelViewer":
                    vscode.commands.executeCommand("dcsLauncher.launchModelViewer");
                    break;
            }
        });
    }

    refresh(): void {
        if (this.webviewView) {
            this.webviewView.webview.html = this.getHtml();
        }
    }

    private getHtml(): string {
        const config = vscode.workspace.getConfiguration("dcsLauncher");
        const dcsExePath = config.get<string>("dcsExePath") ?? "";
        const modelViewerExePath = config.get<string>("modelViewerExePath") ?? "";
        const hasDcsExePath = dcsExePath.length > 0 && fs.existsSync(dcsExePath);
        const hasModelViewerExePath =
            modelViewerExePath.length > 0 && fs.existsSync(modelViewerExePath);

        return `
        <!DOCTYPE html>
        <html>
        <body style="
            margin: 0;
            padding: 6px 8px;
            font-family: var(--vscode-font-family);
        ">

            ${hasDcsExePath ? `
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

                ${hasModelViewerExePath ? `
                    <button id="launchModelViewer"
                        style="
                            width: 100%;
                            padding: 6px 8px;
                            background-color: #ea580c;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            font-size: 12px;
                            font-weight: 500;
                            cursor: pointer;
                            margin-bottom: 6px;
                        ">
                        Launch ModelViewer
                    </button>
                ` : `
                    <button id="selectModelViewerExe"
                        style="
                            width: 100%;
                            padding: 6px 8px;
                            background-color: #6b7280;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            font-size: 12px;
                            font-weight: 500;
                            cursor: pointer;
                            margin-bottom: 6px;
                        ">
                        Set modelviewer2.exe Path
                    </button>
                `}

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
            ` : `
                <button id="selectDcsExe"
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
                    ">
                    Set DCS.exe Path
                </button>
            `}

            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById("launch")?.addEventListener("click", () => {
                    vscode.postMessage({ command: "launch" });
                });

                document.getElementById("launchMulticrew")?.addEventListener("click", () => {
                    vscode.postMessage({ command: "launchMulticrew" });
                });

                document.getElementById("kill")?.addEventListener("click", () => {
                    vscode.postMessage({ command: "kill" });
                });

                document.getElementById("selectDcsExe")?.addEventListener("click", () => {
                    vscode.postMessage({ command: "selectDcsExe" });
                });

                document.getElementById("selectModelViewerExe")?.addEventListener("click", () => {
                    vscode.postMessage({ command: "selectModelViewerExe" });
                });

                document.getElementById("launchModelViewer")?.addEventListener("click", () => {
                    vscode.postMessage({ command: "launchModelViewer" });
                });
            </script>

        </body>
        </html>
        `;
    }
}
