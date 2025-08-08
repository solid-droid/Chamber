# Set environment variables for this session
$env:TAURI_SIGNING_PRIVATE_KEY = "~\.tauri\myapp.key"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "~\.tauri\myapp.pass"
# Run the Tauri build
npm run tauri build


