import * as vscode from "vscode";
import * as path from "path";

export class ModelTreeProvider implements vscode.TreeDataProvider<ModelItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<void> =
        new vscode.EventEmitter<void>();

    readonly onDidChangeTreeData: vscode.Event<void> =
        this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ModelItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<ModelItem[]> {

        const config = vscode.workspace.getConfiguration("dcsLauncher");
        const models = config.get<string[]>("models") ?? [];

        const items: ModelItem[] = [];

        models.forEach(model => {

            const displayName = path.basename(model);

            const item = new ModelItem(
                displayName,
                "model",
                model
            );

            items.push(item);
        });

        items.push(new ModelItem(
            "Add .edm / .lods",
            "add"
        ));

        return Promise.resolve(items);
    }
}

class ModelItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly type: string,
        public readonly fullPath?: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);

        this.contextValue = type;

        switch (type) {

            case "add":
                this.iconPath = new vscode.ThemeIcon("add");
                this.command = {
                    command: "dcsLauncher.addModel",
                    title: "Add .edm / .lods"
                };
                break;

            case "model":
                this.iconPath = new vscode.ThemeIcon("symbol-file");
                this.tooltip = fullPath;
                this.command = {
                    command: "dcsLauncher.launchModelViewerFile",
                    title: "Launch ModelViewer",
                    arguments: [fullPath]
                };
                break;
        }
    }
}
