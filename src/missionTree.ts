import * as vscode from "vscode";
import * as path from "path";

export class MissionItem extends vscode.TreeItem {
    constructor(public readonly missionPath: string) {
        super(
            path.basename(missionPath),
            vscode.TreeItemCollapsibleState.None
        );

        this.tooltip = missionPath;
        this.description = missionPath;
        this.contextValue = "mission";

        this.command = {
            command: "dcsLauncher.launchMission",
            title: "Launch Mission",
            arguments: [missionPath]
        };
    }
}

export class MissionTreeProvider implements vscode.TreeDataProvider<MissionItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<MissionItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: MissionItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<MissionItem[]> {
        const config = vscode.workspace.getConfiguration("dcsLauncher");
        const missions: string[] = config.get("missions") ?? [];

        if (missions.length === 0) {
            return Promise.resolve([
                new MissionItem("(no missions configured)")
            ]);
        }

        return Promise.resolve(
            missions.map(m => new MissionItem(m))
        );
    }
}
