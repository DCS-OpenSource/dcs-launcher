# DCS Launcher

**DCS Launcher** is a Visual Studio Code extension that allows you to launch and control Digital Combat Simulator (DCS) directly from within VS Code.

Designed for rapid development workflows, it eliminates menu navigation and speeds up testing for:

- EFM development  
- Cockpit systems  
- Avionics  
- Mission scripting  
- Lua debugging  
- Mod development  

---

## ✨ Features

### 🟢 Launch DCS
Launch DCS normally using your configured executable path.

### 🔴 Kill DCS
Terminate all running DCS instances instantly (uses native Windows process termination).

### 📂 Mission Launcher
- Add `.miz` files via GUI file picker
- Launch missions directly with command line arguments
- Live refresh (no VS Code restart required)
- Mission list stored per workspace
- Clean mission name display (filename only)
- Full path available via tooltip

### ⌨️ Relaunch Last Mission
Quickly relaunch the most recently launched mission using a keybind.

---

## ⚙️ Requirements

- Windows  
- DCS World installed  
- Visual Studio Code 1.108.0+  

Recommended: use `bin-mt` (multithreaded build).

---

## 🛠 Extension Settings

### Global (User Settings)

`dcsLauncher.dcsExePath`

Full path to your DCS executable:

```json
"dcsLauncher.dcsExePath": "C:\Program Files\Eagle Dynamics\DCS World\bin-mt\DCS.exe"
```

---

### Workspace (Per Project)

`dcsLauncher.missions`

List of missions to show in the launcher:

```json
"dcsLauncher.missions": [
  "Missions/weapon_test.miz",
  "Missions/night_run.miz"
]
```

Relative paths are resolved from workspace root.

---

## ⌨️ Keybindings

Default:

```
F8
```

Launches the last mission that was run.

You can rebind this in:

```
File → Preferences → Keyboard Shortcuts
```

Search for “DCS Launcher”.

---

## 🚀 Workflow

Typical development cycle:

1. Modify Lua / C++ / assets  
2. Press keybind or click mission  
3. DCS launches instantly  
4. Test  
5. Kill DCS  
6. Repeat  

No main menu.  
No manual navigation.  
No wasted time.

---

## 🗺️ Roadmap

Planned improvements:

- Running-state detection  
- Launch / Restart toggle  
- Status indicator  
- Mission sorting  
- Drag-to-reorder missions  

---

## 📦 Release Notes

### 1.0.0
- Added green Launch DCS button  
- Added red Kill DCS button  
- Split Controls and Missions panels  
- Added GUI mission picker  
- Live mission refresh (no restart required)  
- Improved mission name display  
- Removed duplicate toolbar buttons  
- Improved process handling 

---

## 💬 Feedback

Feature requests and improvements are welcome.

---

## 📄 License

MIT
