## [1.3.0] - 2026-09-09
- Added "--no-launcher" command line arg to all DCS startup buttons

## [1.2.0] - 2026-06-15
- Added first-run DCS executable path setup flow
- Added ModelViewer executable path setup and launch button
- Added Models tree for `.edm` and `.lods` files
- Added ModelViewer file launch with reload/single-file arguments

## [1.1.0] - 2026-05-29
- Added blue multicrew test second client button

## [1.0.0] - 2026-05-20

### Added
- 🟢 Green **Launch DCS** control button (launches without command line arguments)
- 🔴 Red **Kill DCS** control button (terminates running DCS instances)
- Split sidebar into:
  - **Controls** (Webview-based UI)
  - **Missions** (TreeView)
- GUI mission picker (Add Mission via file dialog)
- Live mission list refresh (no VS Code restart required)
- Mission display now shows filenames instead of full paths
- Tooltip shows full mission path
- Workspace-scoped mission configuration
- Global DCS executable configuration

### Improved
- Removed duplicate toolbar buttons
- Cleaner sidebar layout
- More compact button styling
- Improved Windows process handling for DCS termination
- Cleaner mission tree structure
