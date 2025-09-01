import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

// Get the new version from the environment variables set by npm
const newVersion = process.env.npm_config_version_tag;

if (!newVersion) {
    console.error('Error: You must provide a new version number using the --version_tag flag (e.g., --version_tag=1.0.1).');
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        `version = "version = "${newVersion}"`
    );
    fs.writeFileSync(cargoTomlPath, newContent);
    console.log(`✅ Updated version in Cargo.toml to ${newVersion}`);
} catch (error) {
    console.error(`❌ Failed to update Cargo.toml: ${error}`);
}
