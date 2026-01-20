import * as vscode from "vscode";
import { MissionTreeProvider } from "./missionTree";
import { launchDcs } from "./launcher";

export function activate(context: vscode.ExtensionContext) {
    console.log('DCS Launcher activated');

    const missionTree = new MissionTreeProvider();

    vscode.window.registerTreeDataProvider(
        "dcsLauncher.missions",
        missionTree
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "dcsLauncher.launchMission",
            async (missionPath: string) => {
                await launchDcs(missionPath);
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.selectDcsExe",
            async () => {
                const file = await vscode.window.showOpenDialog({
                    canSelectMany: false,
                    filters: { "DCS Executable": ["exe"] }
                });

                if (!file || file.length === 0) {
                    return;
                }

                const config = vscode.workspace.getConfiguration("dcsLauncher");
                await config.update(
                    "dcsExePath",
                    file[0].fsPath,
                    vscode.ConfigurationTarget.Global
                );

                vscode.window.showInformationMessage("DCS.exe path set.");
            }
        )
    );
}

export function deactivate() {}
