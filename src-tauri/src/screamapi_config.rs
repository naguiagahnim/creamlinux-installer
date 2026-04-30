use log::{info, warn};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ScreamAPIConfig {
    #[serde(rename = "$schema")]
    pub schema: String,
    #[serde(rename = "$version")]
    pub version: u32,
    pub logging: bool,
    pub log_eos: bool,
    pub block_metrics: bool,
    pub namespace_id: String,
    pub default_dlc_status: String,
    pub override_dlc_status: HashMap<String, String>,
    pub extra_graphql_endpoints: Vec<String>,
    pub extra_entitlements: HashMap<String, String>,
}

impl Default for ScreamAPIConfig {
    fn default() -> Self {
        Self {
            schema: "https://raw.githubusercontent.com/acidicoala/ScreamAPI/master/res/ScreamAPI.schema.json".to_string(),
            version: 3,
            logging: false,
            log_eos: false,
            block_metrics: false,
            namespace_id: String::new(),
            default_dlc_status: "unlocked".to_string(),
            override_dlc_status: HashMap::new(),
            extra_graphql_endpoints: Vec::new(),
            extra_entitlements: HashMap::new(),
        }
    }
}

/// Write a default ScreamAPI config to a specific directory.
/// Called internally by the installer when first setting up ScreamAPI.
pub fn write_default_config(dir: &Path) -> Result<(), String> {
    write_config_to_dir(dir, &ScreamAPIConfig::default())
}

/// Write ScreamAPI config to a specific directory (where the ScreamAPI DLL lives)
pub fn write_config_to_dir(dir: &Path, config: &ScreamAPIConfig) -> Result<(), String> {
    let config_path = dir.join("ScreamAPI.config.json");

    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize ScreamAPI config: {}", e))?;

    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write ScreamAPI config: {}", e))?;

    info!("Wrote ScreamAPI config to: {}", config_path.display());
    Ok(())
}

/// Read ScreamAPI config from a game's install path.
/// Looks for EOSSDK backup files to find the directory.
pub fn read_config(game_path: &str) -> Result<Option<ScreamAPIConfig>, String> {
    let config_path = match find_screamapi_config_path(game_path) {
        Some(p) => p,
        None => return Ok(None),
    };

    if !config_path.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read ScreamAPI config: {}", e))?;

    let config: ScreamAPIConfig = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse ScreamAPI config: {}", e))?;

    info!("Read ScreamAPI config from: {}", config_path.display());
    Ok(Some(config))
}

/// Write ScreamAPI config to the directory where ScreamAPI DLLs are installed.
pub fn write_config(game_path: &str, config: &ScreamAPIConfig) -> Result<(), String> {
    // Find existing config location or fall back to game root
    let config_path = find_screamapi_config_path(game_path)
        .unwrap_or_else(|| Path::new(game_path).join("ScreamAPI.config.json"));

    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize ScreamAPI config: {}", e))?;

    fs::write(&config_path, content)
        .map_err(|e| format!("Failed to write ScreamAPI config: {}", e))?;

    info!("Wrote ScreamAPI config to: {}", config_path.display());
    Ok(())
}

/// Delete ScreamAPI config from a game directory
pub fn delete_config(game_path: &str) -> Result<(), String> {
    let config_path = match find_screamapi_config_path(game_path) {
        Some(p) => p,
        None => return Ok(()),
    };

    if config_path.exists() {
        fs::remove_file(&config_path)
            .map_err(|e| format!("Failed to delete ScreamAPI config: {}", e))?;
        info!("Deleted ScreamAPI config from: {}", config_path.display());
    }

    Ok(())
}

/// Find where the ScreamAPI config should live by looking for EOSSDK backup files
/// (EOSSDK-Win64-Shipping_o.dll or EOSSDK-Win32-Shipping_o.dll)
fn find_screamapi_config_path(game_path: &str) -> Option<PathBuf> {
    use walkdir::WalkDir;

    for entry in WalkDir::new(game_path)
        .max_depth(8)
        .into_iter()
        .filter_map(Result::ok)
    {
        let path = entry.path();
        let filename = path.file_name()?.to_string_lossy();

        if (filename.starts_with("EOSSDK-Win") && filename.ends_with("_o.dll"))
            || filename == "ScreamAPI.config.json"
        {
            let dir = path.parent()?;
            return Some(dir.join("ScreamAPI.config.json"));
        }
    }

    warn!("Could not find ScreamAPI install dir in {}, using game root", game_path);
    None
}