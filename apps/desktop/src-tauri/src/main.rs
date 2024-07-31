// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "macos")]
mod mac;
mod commands;

fn main() {
  let mut ctx = tauri::generate_context!();
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
    .invoke_handler(tauri::generate_handler![
        commands::folder::show_in_folder,
        commands::search::search_files
    ])
    .plugin(tauri_plugin_theme::ThemePlugin::init(ctx.config_mut()))
    .plugin(tauri_plugin_fs_watch::init())
    .plugin(tauri_plugin_fs_extra::init())
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .run(ctx)
    .expect("error while running tauri application");
}