# DCS Launcher

DCS Launcher is a Visual Studio Code extension for launching DCS World, DCS missions, and ModelViewer directly from the VS Code sidebar.

It is built for rapid DCS module development workflows where repeatedly opening menus, selecting missions, or manually starting tools slows down iteration.

## Features

### DCS Controls

- Select and store the path to `DCS.exe`
- Launch DCS directly from the Controls panel
- Launch a multicrew test client
- Kill running DCS instances from VS Code
- Hide launch controls until a valid DCS executable is configured

### Mission Launcher

- Add `.miz` mission files through a file picker
- Store mission lists per workspace
- Show clean filenames in the sidebar
- Show full mission paths in tooltips
- Launch missions directly with DCS command line arguments

### ModelViewer

- Select and store the path to `modelviewer2.exe`
- Launch ModelViewer directly from the Controls panel
- Add `.edm` and `.lods` files through a file picker
- Store model lists per workspace
- Launch selected model files in ModelViewer with reload arguments

### Live DCS Log

- Open `Saved Games/DCS/Logs/dcs.log` in a dedicated editor tab
- Configure a custom path to the DCS log file in VS Code Settings
- Follow new log lines automatically
- Filter lines using text, regular expressions, and case-sensitive matching

## Requirements

- Windows
- Visual Studio Code 1.108.1 or newer
- DCS World installed
- Optional: DCS ModelViewer installed

For DCS, the multithreaded executable under `bin-mt` is recommended.

## Extension Settings

### Global Settings

`dcsLauncher.dcsExePath`

Full path to `DCS.exe`.

```json
"dcsLauncher.dcsExePath": "C:\\Program Files\\Eagle Dynamics\\DCS World\\bin-mt\\DCS.exe"
```

`dcsLauncher.modelViewerExePath`

Full path to `modelviewer2.exe`.

```json
"dcsLauncher.modelViewerExePath": "C:\\Program Files\\Eagle Dynamics\\DCS World\\bin\\modelviewer2.exe"
```

`dcsLauncher.logFilePath`

Full path to the DCS log file. Leave empty to use
`Saved Games/DCS/Logs/dcs.log`. Use the settings menu in the viewer to edit
this in VS Code Settings.

```json
"dcsLauncher.logFilePath": "D:\\DCS.openbeta\\Logs\\dcs.log"
```

### Workspace Settings

`dcsLauncher.missions`

List of mission files shown in the Missions tree.

```json
"dcsLauncher.missions": [
  "Missions/weapon_test.miz",
  "Missions/night_run.miz"
]
```

`dcsLauncher.models`

List of `.edm` and `.lods` files shown in the Models tree.

```json
"dcsLauncher.models": [
  "Shapes/example.edm",
  "Shapes/example.lods"
]
```

Relative paths are resolved from the workspace root.

`dcsLauncher.logExcludedPatterns`

Case-insensitive regular expressions hidden by the live log viewer when
**Hide ignored** is enabled. The default suppresses DCS's recurring negative
payload drag and weight errors. Use the gear button in the viewer to edit the
list in VS Code Settings.

## Keybinding

The default keybinding is:

```text
F8
```

This launches the last mission that was run.

You can change it in VS Code Keyboard Shortcuts by searching for `DCS Launcher`.

## Typical Workflow

1. Configure the path to `DCS.exe`.
2. Add workspace mission files.
3. Click a mission or press the keybinding to launch DCS.
4. Test your module changes.
5. Kill DCS from the Controls panel.
6. Repeat.

For model work:

1. Configure the path to `modelviewer2.exe`.
2. Add `.edm` or `.lods` files to the Models tree.
3. Click a model file to launch it in ModelViewer.

## Development

Install dependencies and verify the extension build:

```text
npm ci
npm run compile
```

Open this repository in VS Code and press `F5` to compile the extension and open
an Extension Development Host window. Use the DCS icon in that window's
activity bar to exercise the development version. Set breakpoints in `src/` and
use `Developer: Reload Window` in the development host after rebuilding.

For automatic rebuilds while editing, run:

```text
npm run watch
```

To build and install a local VSIX in your normal VS Code profile:

```text
npx --yes @vscode/vsce package --out dcs-launcher.vsix
code --install-extension dcs-launcher.vsix --force
```

Reload existing VS Code windows after installation. The generated `dist/`,
`out/`, and `.vsix` files are intentionally ignored by Git.

## Repository

Source code is available at:

https://github.com/DCS-OpenSource/dcs-launcher

## License

MIT
