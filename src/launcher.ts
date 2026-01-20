import * as vscode from "vscode";
import * as path from "path";
import { spawn } from "child_process";
import * as fs from "fs";

export async function launchDcs(
    missionPath: string,
    context: vscode.ExtensionContext
) {
    const config = vscode.workspace.getConfiguration("dcsLauncher");
    const dcsExePath = config.get<string>("dcsExePath");

    if (!dcsExePath || !fs.existsSync(dcsExePath)) {
        vscode.window.showErrorMessage("Valid DCS.exe path is not set.");
        return;
    }

    let resolvedMission = missionPath;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!path.isAbsolute(missionPath) && workspaceFolder) {
        resolvedMission = path.join(workspaceFolder.uri.fsPath, missionPath);
    }

    if (!fs.existsSync(resolvedMission)) {
        vscode.window.showErrorMessage(`Mission not found:\n${resolvedMission}`);
        return;
    }

    const args = [
        "--force_disable_VR",
        "--no-launcher",
        resolvedMission
    ];

    spawn(dcsExePath, args, {
        detached: true,
        stdio: "ignore",
        windowsHide: false
    }).unref();

    // 🔑 Remember last launched mission
    await context.globalState.update("lastMission", resolvedMission);
}
