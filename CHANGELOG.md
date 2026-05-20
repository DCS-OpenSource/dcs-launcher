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
