import * as vscode from "vscode";
import * as path from "path";
import { spawn } from "child_process";
import * as fs from "fs";

export async function launchDcs(missionPath: string) {
    const config = vscode.workspace.getConfiguration("dcsLauncher");
    const dcsExePath = config.get<string>("dcsExePath");

    if (!dcsExePath) {
        vscode.window.showErrorMessage("DCS.exe path is not set.");
        return;
    }

    // Validate exe exists
    if (!fs.existsSync(dcsExePath)) {
        vscode.window.showErrorMessage(`DCS.exe not found:\n${dcsExePath}`);
        return;
    }

    // Resolve mission path
    let resolvedMission = missionPath;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!path.isAbsolute(missionPath) && workspaceFolder) {
        resolvedMission = path.join(workspaceFolder.uri.fsPath, missionPath);
    }

    if (!fs.existsSync(resolvedMission)) {
        vscode.window.showErrorMessage(`Mission file not found:\n${resolvedMission}`);
        return;
    }

    const args = [
        "--force_disable_VR",
        "--no-launcher",
        resolvedMission
    ];

    try {
        spawn(dcsExePath, args, {
            detached: true,
            stdio: "ignore",
            windowsHide: false
        }).unref();
    } catch (err) {
        vscode.window.showErrorMessage(`Failed to launch DCS:\n${String(err)}`);
    }
}
