//! Install the bundled engine into this fork's private application data directory.
use tauri::Manager;

pub fn install(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let source = app.path().resolve("engine/stockfish.exe", tauri::path::BaseDirectory::Resource)?;
    let directory = app.path().app_data_dir()?.join("engines");
    std::fs::create_dir_all(&directory)?;
    let destination = directory.join("stockfish.exe");
    if !destination.exists() || std::fs::metadata(&source)?.len() != std::fs::metadata(&destination)?.len() {
        std::fs::copy(&source, &destination)?;
    }
    let config = directory.join("engines.json");
    let mut engines: Vec<serde_json::Value> = if config.exists() {
        serde_json::from_slice(&std::fs::read(&config)?)?
    } else { vec![] };
    let engine = serde_json::json!({
        "id": "bundled-stockfish", "type": "local", "name": "Stockfish 19",
        "version": "19", "path": destination.to_string_lossy(),
        "enabled": true, "loaded": true, "go": {"t": "Time", "c": 500},
        "settings": [{"name": "Threads", "value": 2}, {"name": "Hash", "value": 128}, {"name": "UCI_ShowWDL", "value": true}]
    });
    if let Some(existing) = engines.iter_mut().find(|e| e["id"] == "bundled-stockfish") {
        // Refresh the path if the application data directory moved.
        existing["path"] = engine["path"].clone();
    } else { engines.insert(0, engine); }
    std::fs::write(config, serde_json::to_vec_pretty(&engines)?)?;
    Ok(())
}
