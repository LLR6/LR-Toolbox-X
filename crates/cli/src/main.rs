use serde_json::Value;
fn main() {
    if let Err(e) = run() {
        eprintln!("{}", serde_json::json!({"error":e.to_string()}));
        std::process::exit(1);
    }
}
fn run() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.first().is_some_and(|s| s == "list") {
        println!("{}", lrx_core::catalog());
        return Ok(());
    }
    if args.len() != 4 || args[0] != "run" {
        return Err("Usage: lrtool-native list | run ACTION INPUT_JSON ROOT_DIRECTORY".into());
    }
    let input: Value = serde_json::from_str(&args[2])?;
    let scope = lrx_core::Scope::new(&args[3])?;
    println!("{}", lrx_core::execute(&args[1], &input, Some(&scope))?);
    Ok(())
}
