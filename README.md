# ⚡ CHAMBER: The App Builder on Steroids 🔨

Chamber is a powerful, cross-platform application builder utilizing the **Tauri** framework for a performant, small-footprint desktop and mobile experience. It leverages a modern frontend, a **Rust**-based core backend, and supplementary **Node.js** and **Python** sidecars for maximum flexibility.

---

## 💻 Tech Stack Overview

| Layer | Technology | Role | Status/Notes |
| :--- | :--- | :--- | :--- |
| **Frontend (UI)** | Webview (HTML/CSS/JS) | Cross-platform user interface rendering. | Uses native webviews for optimal performance. |
| **Backend (Core)** | **Rust/Tauri** | Core application logic, OS interaction, security, and bundling. | The primary runtime environment. |
| **Sidecar** | **Node.js** | Supplementary tasks requiring the Node runtime environment (e.g., file system, complex CLI). | Used only when Rust cannot handle the job efficiently. |
| **Sidecar** | **Python** | **Planned/Untested** for advanced data processing or leveraging specific Python libraries. | To be packaged using PyInstaller or similar tool. |

---

## 🚀 Environment & UI Support

Chamber is built for maximum reach across different platforms.

| Platform | Webview Engine | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Windows** | Edge / Chromium | Fully Supported | |
| **macOS** | WKWebView | Fully Supported | |
| **Linux** | webkit2gtk | Fully Supported | |
| **Android** | Native Webview | Fully Supported | **Note:** Sidecars are currently not supported on Android builds. |

---

## 🛠 Sidecar Management

This section details how to manage the external binary dependencies for the application.

### Node.js Sidecar

The Node.js binary is built using `@yao-pkg/pkg` and bundled with the Tauri application.

1.  **Navigate:** `cd Chamber`
2.  **Build Sidecar Binary:** `npm run package:nodejs`
3.  **Code Location:** Source code for the sidecar is located in `Chamber/src-nodejs`.
4.  **Tauri Config:** Ensure the sidecar is listed in `src-tauri/tauri.conf.json`:
    ```json
    "externalBin": ["binaries/app"] 
    ```

### Python Sidecar

This is currently under development and remains **untested** in the build process.

* **Status:** Not integrated or tested for bundling yet.
* **Android Note:** Sidecar bundling is **currently failing** on Android. For Android builds, you **must** temporarily remove the external binary reference from `tauri.conf.json`:
    ```json
    // In Chamber/src-tauri/tauri.conf.json
    "externalBin": [] 
    ```

---

## ▶️ Scripts & Development

Use the following commands for development, building, and releasing new versions.

| Command | Target Platform | Description |
| :--- | :--- | :--- |
| `npm run tauri dev` | **Desktop** | Starts the application in development mode with hot-reloading. |
| `npm run tauri android dev` | **Android** | Runs the application on a connected Android device or emulator. |
| `npm run package:nodejs` | **Utility** | Builds and relocates the Node.js sidecar binary. |
| `npm run tauri build` | **Desktop** | Creates the production build installers. |
| `npm run tauri android build` | **Android** | Builds the Android release files (AAB). Use `--apk` for direct APK output. |
| `npm run tauri android build -- --apk --split-per-abi` | **Android** | Builds split APKs for different ABIs. |
| `npm run gitRelease --version_tag=0.3.1` | **Release** | Tags the current commit and prepares for release actions. |

**GitHub Actions:** Desktop builds and publishing are triggered automatically when a **Tag version is added to a commit**. (Used by the auto-updater).

---

## 🐛 Troubleshooting & Workarounds

| Error | Solution/Workaround |
| :--- | :--- |
| **Binaries not found (Android)** | **Quick Fix:** Remove `externalBin` from `tauri.conf.json` (sidecars are not supported on Android builds). |
| **Symlinking/Build Errors** | Run your terminal/CMD as **Administrator** to ensure proper file permissions. |
| **Vite/UI Build Error (on CI)** | Caused by inconsistent folder casing in Git. **Fix:** Move affected folders to a temp folder, commit, move them back, and commit again. |
| **Keystore Tag Error (CI)** | Check `java -version`. Ensure you use **JDK 17** to generate the keystore. |