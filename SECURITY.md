# Security policy

This is a prerelease, local-user toolbox. For a vulnerability, use GitHub's private vulnerability reporting if enabled; otherwise open an issue requesting a private reporting channel without exploit details or private data. Do not post secrets in public issues. A dedicated security contact has not been established yet.

No network server, remote shell, plugin loading, automatic clipboard collection, destructive operation or remote AI execution is exposed in this milestone. File actions are read-only and require a root directory. History stores IDs/status/time/duration only.

Known boundaries: canonicalize-then-open can race a hostile local filesystem writer; the desktop uses unsafe-eval to compile trusted built-in Ajv schemas; JSON numeric precision follows JavaScript. Removing these limitations precedes plugins and remote execution. Debug APK and unsigned desktop builds are development artifacts. Never treat JWT decoding as signature validation.
