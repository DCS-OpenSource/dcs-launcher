import * as vscode from "vscode";
import * as path from "path";
import { MissionTreeProvider } from "./missionTree";
import { ModelTreeProvider } from "./modelTree";
import {
    launchDcs,
    killDcs,
    launchDcsStandalone,
    launchDcsMulticrew,
    launchModelViewer,
    launchModelViewerFile
} from "./launcher";
import { ControlsView } from "./controlsView";
import { DcsLogView } from "./dcsLogView";

export function activate(context: vscode.ExtensionContext) {
    const controlsProvider = new ControlsView(context.extensionUri);
    const logView = new DcsLogView();

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ControlsView.viewType,
            controlsProvider
        ),

        vscode.workspace.onDidChangeConfiguration(event => {
            if (
                event.affectsConfiguration("dcsLauncher.dcsExePath") ||
                event.affectsConfiguration("dcsLauncher.modelViewerExePath")
            ) {
                controlsProvider.refresh();
            }

            if (event.affectsConfiguration("dcsLauncher.logExcludedPatterns")) {
                logView.refreshConfiguration();
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "dcsLauncher.selectDcsExe",
            async () => {
                const files = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: { "Executable": ["exe"] },
                    openLabel: "Use DCS.exe",
                    title: "Select DCS.exe"
                });

                const selectedFile = files?.[0];

                if (!selectedFile) {
                    return;
                }

                if (path.basename(selectedFile.fsPath).toLowerCase() !== "dcs.exe") {
                    vscode.window.showErrorMessage("Please select DCS.exe.");
                    return;
                }

                const config = vscode.workspace.getConfiguration("dcsLauncher");

                await config.update(
                    "dcsExePath",
                    selectedFile.fsPath,
                    vscode.ConfigurationTarget.Global
                );

                controlsProvider.refresh();
                vscode.window.showInformationMessage("DCS.exe path saved.");
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.selectModelViewerExe",
            async () => {
                const files = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: { "Executable": ["exe"] },
                    openLabel: "Use modelviewer2.exe",
                    title: "Select modelviewer2.exe"
                });

                const selectedFile = files?.[0];

                if (!selectedFile) {
                    return;
                }

                if (path.basename(selectedFile.fsPath).toLowerCase() !== "modelviewer2.exe") {
                    vscode.window.showErrorMessage("Please select modelviewer2.exe.");
                    return;
                }

                const config = vscode.workspace.getConfiguration("dcsLauncher");

                await config.update(
                    "modelViewerExePath",
                    selectedFile.fsPath,
                    vscode.ConfigurationTarget.Global
                );

                controlsProvider.refresh();
                vscode.window.showInformationMessage("modelviewer2.exe path saved.");
            }
        )
    );
    
    const missionTree = new MissionTreeProvider();
    const modelTree = new ModelTreeProvider();

    vscode.window.registerTreeDataProvider(
        "dcsLauncher.missions",
        missionTree
    );

    vscode.window.registerTreeDataProvider(
        "dcsLauncher.models",
        modelTree
    );

    context.subscriptions.push(
        logView,

        vscode.commands.registerCommand(
            "dcsLauncher.openLog",
            () => {
                logView.show();
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.launchStandalone",
            () => {
                launchDcsStandalone();
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.launchMulticrew",
            () => {
                launchDcsMulticrew();
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.launchModelViewer",
            () => {
                launchModelViewer();
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.launchMission",
            async (missionPath: string) => {
                await launchDcs(missionPath, context);
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.launchModelViewerFile",
            async (modelPath: string) => {
                await launchModelViewerFile(modelPath);
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.addMission",
            async () => {

                const files = await vscode.window.showOpenDialog({
                    canSelectMany: true,
                    filters: { "DCS Mission": ["miz"] }
                });

                if (!files) {return;};

                const config = vscode.workspace.getConfiguration("dcsLauncher");
                const existing = config.get<string[]>("missions") ?? [];

                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

                const newMissions = files.map(file => {
                    if (workspaceFolder) {
                        const relative = vscode.workspace.asRelativePath(file);
                        return relative;
                    }
                    return file.fsPath;
                });

                const updated = [...existing, ...newMissions];

                await config.update(
                    "missions",
                    updated,
                    vscode.ConfigurationTarget.Workspace
                );

                missionTree.refresh(); // 🔄 LIVE UPDATE
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.addModel",
            async () => {

                const files = await vscode.window.showOpenDialog({
                    canSelectMany: true,
                    filters: { "DCS Model": ["edm", "lods"] }
                });

                if (!files) {return;};

                const config = vscode.workspace.getConfiguration("dcsLauncher");
                const existing = config.get<string[]>("models") ?? [];

                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

                const newModels = files.map(file => {
                    if (workspaceFolder) {
                        const relative = vscode.workspace.asRelativePath(file);
                        return relative;
                    }
                    return file.fsPath;
                });

                const updated = [...existing, ...newModels];

                await config.update(
                    "models",
                    updated,
                    vscode.ConfigurationTarget.Workspace
                );

                modelTree.refresh();
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.killDcs",
            () => {
                killDcs();
            }
        )
    );
}
