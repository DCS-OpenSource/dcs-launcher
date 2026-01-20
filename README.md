# DCS Launcher

**DCS Launcher** is a Visual Studio Code extension that lets you **launch Digital Combat Simulator (DCS) missions directly from VS Code**, bypassing the main menu.  
It’s designed for **rapid iteration**, making it ideal for **EFM, avionics, systems, and mission development**.

Launch missions with one click or a keybind — no more navigating menus between test runs.

---

## ✨ Features

- 🚀 **One-click mission launch** from the VS Code Activity Bar  
- 📂 **Per-workspace mission lists** (stored in `.vscode/settings.json`)  
- ⚙️ **Global DCS.exe configuration** (set once, reuse everywhere)  
- ⌨️ **Keybinding to relaunch the last mission**  
- 🧠 Remembers the **last launched mission** across restarts  
- 🪟 Uses native Windows process spawning (no PowerShell issues)  
- 🎯 Perfect for rapid EFM / cockpit / systems testing  

---

## 🧭 How It Works

1. Configure the path to `DCS.exe` once (global setting)  
2. Add one or more `.miz` files to your workspace settings  
3. Select a mission from the **DCS Launcher** sidebar  
4. DCS launches **directly into the mission**, skipping the menu  

---

## ⚙️ Requirements

- **Windows**
- **DCS World installed**
- Visual Studio Code **v1.108.0 or newer**

> Recommended: use the **bin-mt** version of DCS for multithreaded builds.

---

## 🛠 Extension Settings

This extension contributes the following settings:

### Global (User Settings)

- **`dcsLauncher.dcsExePath`**  
  Full path to `DCS.exe`  

```json
"dcsLauncher.dcsExePath": "C:\\Program Files\\Eagle Dynamics\\DCS World\\bin-mt\\DCS.exe"
```

### Workspace (Per Project)

- **`dcsLauncher.missions`**  
  List of mission files to show in the launcher  

```json
"dcsLauncher.missions": [
  "Missions/weapon_test.miz",
  "Missions/night_run.miz",
  "C:/Users/you/Saved Games/DCS/Missions/debug.miz"
]
```

Relative paths are resolved from the workspace root.

---

## ⌨️ Keybindings

### Default Keybinding

- **Launch Last Mission**
```
F8
```

This instantly relaunches the **most recently launched mission**, perfect for tight edit-test cycles.

You can rebind this in:

```
File → Preferences → Keyboard Shortcuts
```

Search for **“DCS Launcher”**.

---

## 📌 Commands

- **DCS Launcher: Launch Mission**
- **DCS Launcher: Launch Last Mission**
- **DCS Launcher: Select DCS Executable**

All commands are available from the Command Palette.

---

## 🧪 Known Issues

- Does not currently detect if DCS is already running
- No mission add/remove UI yet (missions are managed via settings)

---

## 🗺️ Roadmap

Planned improvements:

- ➕ Add missions via file picker  
- 🔄 Refresh button in mission list  
- ▶️ Play / Stop toggle (detect running DCS)  

---

## 📦 Release Notes

### 0.1.0
- Initial functional release  
- Sidebar launcher  
- Mission list per workspace  
- Global DCS path  
- Keybinding for last mission  

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.  
This extension was built to support **real-world DCS development workflows**, so feedback from other developers is highly valued.

---

## 📄 License

MIT

---

**Happy flying — and happy debugging.** ✈️
