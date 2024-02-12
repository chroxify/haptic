// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "macos")]
mod mac;
mod commands;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(target_os = "macos") {
          #[cfg(target_os = "macos")]
          use mac::window::setup_mac_window;

          #[cfg(target_os = "macos")]
          setup_mac_window(app);
      }

        Ok(())
    })
    .invoke_handler(tauri::generate_handler![commands::folder::show_in_folder])
    .plugin(tauri_plugin_fs_watch::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
