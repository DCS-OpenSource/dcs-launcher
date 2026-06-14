import * as vscode from "vscode";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";
import * as fs from "fs";

let currentDcsProcess: ChildProcess | null = null;

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

    currentDcsProcess = spawn(dcsExePath, args, {
        detached: true,
        windowsHide: false,
        stdio: "ignore"
    });

    currentDcsProcess.on("exit", () => {
        currentDcsProcess = null;
    });

    await context.globalState.update("lastMission", resolvedMission);
}

export async function launchDcsStandalone() {

    const config = vscode.workspace.getConfiguration("dcsLauncher");
    const dcsExePath = config.get<string>("dcsExePath");

    if (!dcsExePath || !fs.existsSync(dcsExePath)) {
        vscode.window.showErrorMessage("Valid DCS.exe path is not set.");
        return;
    }

    spawn(dcsExePath, [], {
        detached: true,
        windowsHide: false
    });

    vscode.window.showInformationMessage("DCS launched.");
}

export async function launchDcsMulticrew() {

    const config = vscode.workspace.getConfiguration("dcsLauncher");
    const dcsExePath = config.get<string>("dcsExePath");

    if (!dcsExePath || !fs.existsSync(dcsExePath)) {
        vscode.window.showErrorMessage("Valid DCS.exe path is not set.");
        return;
    }

    spawn(dcsExePath, ["-w", "DCS.multicrew"], {
        detached: true,
        windowsHide: false
    });

    vscode.window.showInformationMessage("DCS multicrew launched.");
}

export async function launchModelViewer() {

    const config = vscode.workspace.getConfiguration("dcsLauncher");
    const modelViewerExePath = config.get<string>("modelViewerExePath");

    if (!modelViewerExePath || !fs.existsSync(modelViewerExePath)) {
        vscode.window.showErrorMessage("Valid modelviewer2.exe path is not set.");
        return;
    }

    spawn(modelViewerExePath, [], {
        detached: true,
        windowsHide: false
    });

    vscode.window.showInformationMessage("ModelViewer launched.");
}

export async function launchModelViewerFile(modelPath: string) {

    const config = vscode.workspace.getConfiguration("dcsLauncher");
    const modelViewerExePath = config.get<string>("modelViewerExePath");

    if (!modelViewerExePath || !fs.existsSync(modelViewerExePath)) {
        vscode.window.showErrorMessage("Valid modelviewer2.exe path is not set.");
        return;
    }

    let resolvedModel = modelPath;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!path.isAbsolute(modelPath) && workspaceFolder) {
        resolvedModel = path.join(workspaceFolder.uri.fsPath, modelPath);
    }

    if (!fs.existsSync(resolvedModel)) {
        vscode.window.showErrorMessage(`Model file not found:\n${resolvedModel}`);
        return;
    }

    spawn(modelViewerExePath, ["--reload", "--single", "s", resolvedModel], {
        detached: true,
        windowsHide: false
    });

    vscode.window.showInformationMessage("ModelViewer launched.");
}

export function killDcs() {
    const killer = spawn("taskkill", [
        "/IM",
        "DCS.exe",
        "/T",
        "/F"
    ]);

    killer.on("exit", (code) => {
        if (code === 0) {
            vscode.window.showInformationMessage("DCS terminated.");
        } else {
            vscode.window.showWarningMessage("No running DCS instance found.");
        }
    });
}
