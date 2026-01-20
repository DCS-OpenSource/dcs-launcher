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
            "dcsLauncher.launchLastMission",
            async () => {
                const lastMission = context.globalState.get<string>("lastMission");

                if (!lastMission) {
                    vscode.window.showWarningMessage(
                        "No mission has been launched yet."
                    );
                    return;
                }

                await launchDcs(lastMission, context);
            }
        ),

        vscode.commands.registerCommand(
            "dcsLauncher.selectDcsExe",
            async () => {
                const file = await vscode.window.showOpenDialog({
                    canSelectMany: false,
                    filters: { "Executable": ["exe"] }
                });

                if (!file) {return;}

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
