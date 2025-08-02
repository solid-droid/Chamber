// lib.rs file
use tauri::{AppHandle, Manager, Runtime}; // Ensure Runtime is imported for v2 setup

// Command to greet a name (already present)
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// Command to check if the application is running in development mode
#[tauri::command]
fn is_dev_mode() -> bool {
    cfg!(dev)
}

// Command to conditionally open DevTools
// This command can be called from the frontend, but the actual opening
// is guarded by `debug_assertions` in Rust.
#[tauri::command]
fn open_devtools_command<R: Runtime>(_app_handle: AppHandle<R>) {
    #[cfg(debug_assertions)] // This ensures the devtools code is only compiled in debug builds
    {
        // For Tauri v2, use `get_webview_window` to access the webview window
        if let Some(window) = _app_handle.get_webview_window("main") {
            window.open_devtools();
        }
    }
}

// Main entry point for the Tauri application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init()) // Your existing plugin
        .invoke_handler(tauri::generate_handler![
            greet,
            is_dev_mode, // Add our new command here
            open_devtools_command
        ])
        .setup(|_app| {
            // This setup block runs after the app is initialized but before windows are shown.
            // It's a great place for initial setup logic.

            #[cfg(debug_assertions)] // Only execute in debug builds
            {
                // This is a common pattern to automatically open devtools in development.
                // It uses `debug_assertions` which is true for `tauri dev` and `tauri build --debug`.
                // If you only want it for `tauri dev`, you could combine with `cfg!(dev)`
                // or expose a more granular flag via a command as shown with `is_dev_mode`.

                if let Some(window) = _app.get_webview_window("main") {
                    // Only open devtools if we are in a debug build

                    println!("Debug build detected: Opening DevTools for 'main' window.");
                    window.open_devtools();
                }
            }

            Ok(()) // Setup hook must return a Result
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
