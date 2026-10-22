# Contributing

Use a feature branch and a PR. Each action needs a unique meaningful ID, Chinese/English names, description, tags, input/output JSON schemas, platforms, permissions, risk, timeout, real handler, normal and invalid-path tests and a useful example. Keep actions atomic and independently useful; renaming one identical function does not create a new capability.

Add portable handlers to packages/registry/src, register in index.ts, run npm test and npm run catalog, then copy regenerated catalog to Android assets. New native operations belong to crates/core and must share execution with the Rust CLI and Tauri. Android supports only IDs with implemented Kotlin dispatch. Do not count unsupported or disabled entries.

Run npm run lint, npm run typecheck, npm test, npm run build, cargo fmt --all -- --check, cargo clippy --workspace --all-targets --locked -- -D warnings and cargo test --workspace --locked. Test Chinese, spaces and Emoji, invalid input, scope escape and platform differences when relevant. Never commit secrets or signing material. Conventional Commit messages are preferred.
