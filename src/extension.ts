import * as vscode from "vscode";
import { MissionTreeProvider } from "./missionTree";
import {
    launchDcs,
    killDcs,
    launchDcsStandalone,
    launchDcsMulticrew
} from "./launcher";
import { ControlsView } from "./controlsView";

export function activate(context: vscode.ExtensionContext) {
    const controlsProvider = new ControlsView(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ControlsView.viewType,
            controlsProvider
        )
    );
    
    const missionTree = new MissionTreeProvider();

    vscode.window.registerTreeDataProvider(
        "dcsLauncher.missions",
        missionTree
    );

    context.subscriptions.push(

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
            "dcsLauncher.launchMission",
            async (missionPath: string) => {
                await launchDcs(missionPath, context);
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
            "dcsLauncher.killDcs",
            () => {
                killDcs();
            }
        )
    );
}
