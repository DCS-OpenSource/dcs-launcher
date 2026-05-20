import * as vscode from "vscode";
import { MissionTreeProvider } from "./missionTree";
import { launchDcs } from "./launcher";

export function activate(context: vscode.ExtensionContext) {
    const missionTree = new MissionTreeProvider();

    vscode.window.registerTreeDataProvider(
        "dcsLauncher.missions",
        missionTree
    );

    context.subscriptions.push(

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
        )
    );
}