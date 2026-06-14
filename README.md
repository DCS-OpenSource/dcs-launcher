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

## Repository

Source code is available at:

https://github.com/DCS-OpenSource/dcs-launcher

## License

MIT
