import * as vscode from "vscode";
import * as path from "path";

export class MissionTreeProvider implements vscode.TreeDataProvider<MissionItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<void> =
        new vscode.EventEmitter<void>();

    readonly onDidChangeTreeData: vscode.Event<void> =
        this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: MissionItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<MissionItem[]> {

        const config = vscode.workspace.getConfiguration("dcsLauncher");
        const missions = config.get<string[]>("missions") ?? [];

        const items: MissionItem[] = [];

        // 🎯 Mission List
        missions.forEach(mission => {

            const displayName = path.basename(mission);

            const item = new MissionItem(
                displayName,
                "mission",
                mission
            );

            items.push(item);
        });
        
        // 🔵 Add Mission Button
        items.push(new MissionItem(
            "Add Mission",
            "add"
        ));

        return Promise.resolve(items);
    }
}


class MissionItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly type: string,
        public readonly fullPath?: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);

        this.contextValue = type;

        switch (type) {

            case "kill":
                this.iconPath = new vscode.ThemeIcon("debug-stop");
                this.command = {
                    command: "dcsLauncher.killDcs",
                    title: "Kill DCS"
                };
                break;

            case "add":
                this.iconPath = new vscode.ThemeIcon("add");
                this.command = {
                    command: "dcsLauncher.addMission",
                    title: "Add Mission"
                };
                break;

            case "mission":
                this.iconPath = new vscode.ThemeIcon("play");
                this.tooltip = fullPath;
                this.command = {
                    command: "dcsLauncher.launchMission",
                    title: "Launch Mission",
                    arguments: [fullPath]
                };
                break;

            case "separator":
                this.iconPath = undefined;
                this.command = undefined;
                break;
        }
    }
}