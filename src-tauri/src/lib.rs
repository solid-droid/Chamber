// lib.rs file
use tauri::{Manager, AppHandle}; // Make sure these imports are correct

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_devtools_command(app_handle: AppHandle) {
    #[cfg(debug_assertions)] // Only allow this in debug builds
    {
        // Use get_webview_window instead of get_window for Tauri v2
        if let Some(window) = app_handle.get_webview_window("main") { // Changed from get_window
            window.open_devtools();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, open_devtools_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}