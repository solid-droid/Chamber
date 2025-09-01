const fs = require('fs');
const path = require('path');

// Get the new version from the command-line arguments or npm config
const newVersion = process.env.npm_config_v || process.argv[2];

if (!newVersion) {
    console.error('Error: You must provide a new version number (e.g., 1.0.1).');
    process.exit(1);
}

// --- Update package.json ---
const packageJsonPath = path.join(__dirname, 'package.json');
try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`✅ Updated version in package.json to ${newVersion}`);
} catch (error) {
    console.error(`❌ Failed to update package.json: ${error}`);
}

// --- Update src-tauri/tauri.conf.json ---
const tauriConfPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
try {
    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
    tauriConf.package.version = newVersion;
    fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2));
    console.log(`✅ Updated version in tauri.conf.json to ${newVersion}`);
} catch (error) {
    console.error(`❌ Failed to update tauri.conf.json: ${error}`);
}

// --- Update src-tauri/Cargo.toml ---
const cargoTomlPath = path.join(__dirname, 'src-tauri', 'Cargo.toml');
try {
    let cargoTomlContent = fs.readFileSync(cargoTomlPath, 'utf8');
    const newContent = cargoTomlContent.replace(
        /version = ".*?"/,
        `version = "${newVersion}"`
    );
    fs.writeFileSync(cargoTomlPath, newContent);
    console.log(`✅ Updated version in Cargo.toml to ${newVersion}`);
} catch (error) {
    console.error(`❌ Failed to update Cargo.toml: ${error}`);
}
