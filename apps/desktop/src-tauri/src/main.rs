#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde_json::Value;
use std::sync::Mutex;
use tauri::Manager;
struct State(Mutex<lrx_core::History>);
#[tauri::command]
fn native_catalog() -> Value {
    lrx_core::catalog()
}
#[tauri::command]
async fn run_native(
    id: String,
    input: Value,
    root: Option<String>,
) -> Result<Value, lrx_core::AppError> {
    tauri::async_runtime::spawn_blocking(move || {
        let scope = root.map(lrx_core::Scope::new).transpose()?;
        lrx_core::execute(&id, &input, scope.as_ref())
    })
    .await
    .map_err(|_| lrx_core::AppError {
        code: "ActionError",
        message: "Native worker failed".into(),
    })?
}
#[tauri::command]
fn record_history(
    state: tauri::State<State>,
    id: String,
    status: String,
    elapsed_ms: u64,
) -> Result<(), String> {
    state
        .0
        .lock()
        .map_err(|_| "History unavailable".to_string())?
        .record(&id, &status, elapsed_ms)
        .map_err(|e| e.to_string())
}
#[tauri::command]
fn clear_history(state: tauri::State<State>) -> Result<(), String> {
    state
        .0
        .lock()
        .map_err(|_| "History unavailable".to_string())?
        .clear()
        .map_err(|e| e.to_string())
}
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let path = app.path().app_data_dir()?;
            std::fs::create_dir_all(&path)?;
            app.manage(State(Mutex::new(lrx_core::History::open(
                path.join("history.db"),
            )?)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            native_catalog,
            run_native,
            record_history,
            clear_history
        ])
        .run(tauri::generate_context!())
        .expect("Unable to start LR Toolbox X");
}
