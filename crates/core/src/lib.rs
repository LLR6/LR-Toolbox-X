use rusqlite::{params, Connection};
use serde::Serialize;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    fs,
    io::Read,
    path::{Path, PathBuf},
    time::Instant,
};

#[derive(Debug, Serialize)]
pub struct AppError {
    pub code: &'static str,
    pub message: String,
}
impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", self.code, self.message)
    }
}
impl std::error::Error for AppError {}
fn err(code: &'static str, message: &str) -> AppError {
    AppError {
        code,
        message: message.into(),
    }
}
impl From<std::io::Error> for AppError {
    fn from(_: std::io::Error) -> Self {
        err("IOError", "Unable to read file; check path and permissions")
    }
}
impl From<rusqlite::Error> for AppError {
    fn from(_: rusqlite::Error) -> Self {
        err("IOError", "Unable to access local history database")
    }
}

pub struct Scope {
    root: PathBuf,
}
impl Scope {
    pub fn new(root: impl AsRef<Path>) -> Result<Self, AppError> {
        let root = root.as_ref().canonicalize()?;
        if !root.is_dir() {
            return Err(err("ValidationError", "Root must be a directory"));
        }
        Ok(Self { root })
    }
    pub fn resolve(&self, value: &str) -> Result<PathBuf, AppError> {
        let p = Path::new(value);
        if p.is_absolute()
            || p.components().any(|x| {
                !matches!(
                    x,
                    std::path::Component::Normal(_) | std::path::Component::CurDir
                )
            })
        {
            return Err(err(
                "PermissionError",
                "Use a relative path without parent traversal",
            ));
        }
        let resolved = self.root.join(p).canonicalize()?;
        if !resolved.starts_with(&self.root) {
            return Err(err("PermissionError", "Path escapes the granted root"));
        }
        Ok(resolved)
    }
}

pub fn catalog() -> Value {
    let items = [
        (
            "file.info",
            "文件信息",
            "File info",
            "读取文件类型与字节大小",
        ),
        (
            "file.read.utf8",
            "读取 UTF-8",
            "Read UTF-8",
            "读取不超过 1 MiB 的 UTF-8 文件",
        ),
        (
            "file.list",
            "目录列表",
            "List directory",
            "读取最多 5000 个目录项；不递归",
        ),
        (
            "file.hash.sha256",
            "文件 SHA-256",
            "File SHA-256",
            "流式计算不超过 1 GiB 文件的 SHA-256",
        ),
        (
            "file.compare",
            "文件内容比较",
            "Compare files",
            "比较两个不超过 1 GiB 文件的字节内容",
        ),
    ];
    let mut out:Vec<Value>=items.into_iter().map(|(id,name,en,description)|{let mut props=json!({"path":{"type":"string","maxLength":4096}});let required=if id=="file.compare"{props["other"]=json!({"type":"string","maxLength":4096});json!(["path","other"])}else{json!(["path"])};json!({"id":id,"name":name,"nameEn":en,"description":description,"category":"Files","tags":["file","文件"],"input_schema":{"type":"object","properties":props,"required":required,"additionalProperties":false},"output_schema":{"type":"object"},"platforms":["windows","linux","macos","cli"],"permissions":["filesystem.read"],"risk_level":"sensitive","timeout":30000,"example":if id=="file.compare"{json!({"path":"README.md","other":"README.md"})}else{json!({"path":"README.md"})}})}).collect();
    out.push(json!({"id":"system.info","name":"系统信息","nameEn":"System information","description":"读取真实操作系统、CPU 架构和可用逻辑处理器数","category":"System","tags":["system","系统"],"input_schema":{"type":"object","properties":{},"required":[],"additionalProperties":false},"output_schema":{"type":"object"},"platforms":["windows","linux","macos","cli"],"permissions":[],"risk_level":"safe","timeout":1000,"example":{}}));
    json!(out)
}

pub fn execute(id: &str, input: &Value, scope: Option<&Scope>) -> Result<Value, AppError> {
    let catalog = catalog();
    let action = catalog
        .as_array()
        .unwrap()
        .iter()
        .find(|a| a["id"] == id)
        .ok_or_else(|| err("ActionError", "Unknown native action"))?;
    let object = input
        .as_object()
        .ok_or_else(|| err("ValidationError", "Input must be an object"))?;
    let required = action["input_schema"]["required"].as_array().unwrap();
    if object.len() != required.len()
        || required.iter().any(|k| {
            object
                .get(k.as_str().unwrap())
                .and_then(Value::as_str)
                .is_none_or(|v| v.len() > 4096)
        })
    {
        return Err(err("ValidationError", "Invalid parameters"));
    }
    if id == "system.info" {
        return Ok(
            json!({"os":std::env::consts::OS,"architecture":std::env::consts::ARCH,"logicalProcessors":std::thread::available_parallelism().map(|x|x.get()).unwrap_or(1)}),
        );
    }
    let scope =
        scope.ok_or_else(|| err("PermissionError", "Grant a directory before reading files"))?;
    let path = scope.resolve(input["path"].as_str().unwrap())?;
    match id {
        "file.info" => {
            let m = fs::metadata(path)?;
            Ok(json!({"isFile":m.is_file(),"isDirectory":m.is_dir(),"bytes":m.len()}))
        }
        "file.list" => {
            let mut entries = Vec::new();
            for entry in fs::read_dir(path)?.take(5001) {
                if entries.len() == 5000 {
                    return Err(err("ValidationError", "Directory exceeds 5000 entries"));
                }
                let e = entry?;
                entries.push(e.file_name().to_string_lossy().to_string());
            }
            entries.sort();
            Ok(json!({"entries":entries}))
        }
        "file.read.utf8" => {
            if !fs::metadata(&path)?.is_file() {
                return Err(err("ValidationError", "Requires a regular file"));
            }
            let mut buffer = Vec::new();
            fs::File::open(path)?
                .take(1_048_577)
                .read_to_end(&mut buffer)?;
            if buffer.len() > 1_048_576 {
                return Err(err("ValidationError", "File exceeds 1 MiB limit"));
            }
            let text = String::from_utf8(buffer)
                .map_err(|_| err("ValidationError", "File is not UTF-8"))?;
            Ok(json!({"text":text}))
        }
        "file.hash.sha256" => {
            let start = Instant::now();
            if !fs::metadata(&path)?.is_file() {
                return Err(err("ValidationError", "Requires a regular file"));
            }
            let mut f = fs::File::open(path)?;
            check_size(&f)?;
            let mut hash = Sha256::new();
            let mut buffer = [0u8; 65536];
            let mut total = 0u64;
            loop {
                if start.elapsed().as_secs() >= 30 {
                    return Err(err("TimeoutError", "Hash exceeded 30 seconds"));
                }
                let count = f.read(&mut buffer)?;
                if count == 0 {
                    break;
                }
                total += count as u64;
                if total > 1_073_741_824 {
                    return Err(err("ValidationError", "File exceeds 1 GiB limit"));
                }
                hash.update(&buffer[..count]);
            }
            Ok(json!({"sha256":format!("{:x}",hash.finalize()),"bytes":total}))
        }
        "file.compare" => {
            let other = scope.resolve(input["other"].as_str().unwrap())?;
            if !fs::metadata(&path)?.is_file() || !fs::metadata(&other)?.is_file() {
                return Err(err("ValidationError", "Requires regular files"));
            }
            let mut a = fs::File::open(path)?;
            let mut b = fs::File::open(other)?;
            check_size(&a)?;
            check_size(&b)?;
            if a.metadata()?.len() != b.metadata()?.len() {
                return Ok(json!({"equal":false}));
            }
            let start = Instant::now();
            let mut ba = [0u8; 65536];
            let mut bb = [0u8; 65536];
            let mut total = 0u64;
            loop {
                if start.elapsed().as_secs() >= 30 {
                    return Err(err("TimeoutError", "Compare exceeded 30 seconds"));
                }
                let na = read_chunk(&mut a, &mut ba)?;
                let nb = read_chunk(&mut b, &mut bb)?;
                total += na as u64;
                if total > 1_073_741_824 {
                    return Err(err("ValidationError", "File exceeds 1 GiB limit"));
                }
                if na != nb || ba[..na] != bb[..nb] {
                    return Ok(json!({"equal":false}));
                }
                if na == 0 {
                    break;
                }
            }
            Ok(json!({"equal":true}))
        }
        _ => Err(err("ActionError", "Unknown action")),
    }
}
fn read_chunk(file: &mut fs::File, buffer: &mut [u8]) -> Result<usize, AppError> {
    let mut size = 0;
    while size < buffer.len() {
        let n = file.read(&mut buffer[size..])?;
        if n == 0 {
            break;
        }
        size += n;
    }
    Ok(size)
}
fn check_size(f: &fs::File) -> Result<(), AppError> {
    let m = f.metadata()?;
    if !m.is_file() || m.len() > 1_073_741_824 {
        return Err(err(
            "ValidationError",
            "Requires regular file no larger than 1 GiB",
        ));
    }
    Ok(())
}

pub struct History(Connection);
impl History {
    pub fn open(path: impl AsRef<Path>) -> Result<Self, AppError> {
        let db = Connection::open(path)?;
        db.execute_batch("CREATE TABLE IF NOT EXISTS history(id INTEGER PRIMARY KEY, action TEXT NOT NULL, status TEXT NOT NULL, elapsed_ms INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);")?;
        Ok(Self(db))
    }
    pub fn record(&self, action: &str, status: &str, ms: u64) -> Result<(), AppError> {
        if action.len() > 128 || !["success", "error"].contains(&status) {
            return Err(err("ValidationError", "Invalid history metadata"));
        }
        self.0.execute(
            "INSERT INTO history(action,status,elapsed_ms) VALUES(?1,?2,?3)",
            params![action, status, ms.min(i64::MAX as u64) as i64],
        )?;
        self.0.execute("DELETE FROM history WHERE id NOT IN (SELECT id FROM history ORDER BY id DESC LIMIT 500)",[])?;
        Ok(())
    }
    pub fn recent(&self) -> Result<Value, AppError> {
        let mut statement = self.0.prepare(
            "SELECT action,status,elapsed_ms,created_at FROM history ORDER BY id DESC LIMIT 100",
        )?;
        let rows=statement.query_map([],|r|Ok(json!({"action":r.get::<_,String>(0)?,"status":r.get::<_,String>(1)?,"elapsedMs":r.get::<_,u64>(2)?,"time":r.get::<_,String>(3)?})))?;
        Ok(json!(rows.collect::<Result<Vec<_>, _>>()?))
    }
    pub fn clear(&self) -> Result<(), AppError> {
        self.0.execute("DELETE FROM history", [])?;
        Ok(())
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn all_handlers_and_validation() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("中文 🧪.txt"), "abc").unwrap();
        let scope = Scope::new(dir.path()).unwrap();
        for a in catalog().as_array().unwrap() {
            let id = a["id"].as_str().unwrap();
            let input = if id == "system.info" {
                json!({})
            } else if id == "file.compare" {
                json!({"path":"中文 🧪.txt","other":"中文 🧪.txt"})
            } else if id == "file.list" {
                json!({"path":"."})
            } else {
                json!({"path":"中文 🧪.txt"})
            };
            assert!(execute(id, &input, Some(&scope)).is_ok(), "{id}");
            assert!(execute(id, &json!({"unexpected":1}), Some(&scope)).is_err());
        }
        assert_eq!(
            execute(
                "file.hash.sha256",
                &json!({"path":"中文 🧪.txt"}),
                Some(&scope)
            )
            .unwrap()["sha256"],
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
        );
        assert!(scope.resolve("../outside").is_err());
        assert!(scope.resolve("/etc/passwd").is_err());
        assert!(execute("file.info", &json!({"path":"."}), None).is_err());
        assert!(execute("file.info", &json!({"path":"missing"}), Some(&scope)).is_err());
    }
    #[test]
    fn history_excludes_payload() {
        let h = History::open(":memory:").unwrap();
        h.record("json.format", "success", 5).unwrap();
        assert_eq!(h.recent().unwrap()[0]["action"], "json.format");
        h.clear().unwrap();
        assert_eq!(h.recent().unwrap(), json!([]));
    }
    #[cfg(unix)]
    #[test]
    fn symlink_escape_denied() {
        let root = tempfile::tempdir().unwrap();
        let outside = tempfile::tempdir().unwrap();
        std::os::unix::fs::symlink(outside.path(), root.path().join("escape")).unwrap();
        assert!(Scope::new(root.path()).unwrap().resolve("escape").is_err());
    }
}
