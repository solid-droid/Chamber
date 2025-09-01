import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Find the project root directory by searching for package.json
function findProjectRoot(startPath) {
    let currentPath = startPath;
    while (currentPath !== path.parse(currentPath).root) {
        if (fs.existsSync(path.join(currentPath, 'package.json'))) {
            return currentPath;
        }
        currentPath = path.dirname(currentPath);
    }
    return null;
}

const newVersion = process.env.npm_config_version_tag;
if (!newVersion) {
    console.error('Error: You must provide a new version number using the --version_tag flag.');
    process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const scriptDir = dirname(__filename);
const projectRoot = findProjectRoot(scriptDir);

if (!projectRoot) {
    console.error('Error: Could not find project root containing package.json.');
    process.exit(1);
}

// --- Update configuration files ---
const filesToUpdate = [
    {
        path: path.join(projectRoot, 'package.json'),
        update: (content) => {
            const json = JSON.parse(content);
            json.version = newVersion;
            return JSON.stringify(json, null, 2);
        },
        message: 'package.json'
    },
    {
        path: path.join(projectRoot, 'src-tauri', 'tauri.conf.json'),
        update: (content) => {
            const json = JSON.parse(content);
            json.version = newVersion;
            return JSON.stringify(json, null, 2);
        },
        message: 'src-tauri/tauri.conf.json'
    },
    {
        path: path.join(projectRoot, 'src-tauri', 'Cargo.toml'),
        update: (content) => {
            return content.replace(/version = ".*?"/, `version = "${newVersion}"`);
        },
        message: 'src-tauri/Cargo.toml'
    }
];

filesToUpdate.forEach(file => {
    try {
        let content = fs.readFileSync(file.path, 'utf8');
        content = file.update(content);
        fs.writeFileSync(file.path, content);
        console.log(`✅ Updated version in ${file.message} to ${newVersion}`);
    } catch (error) {
        console.error(`❌ Failed to update ${file.message}: ${error.message}`);
        process.exit(1);
    }
});

// --- Git operations with a 2-second delay ---
console.log(`\n⏳ Waiting for 2 seconds before running Git commands...`);

setTimeout(() => {
    try {
        console.log(`\n⏳ Running Git commands...`);
        
        // Add the updated files to the staging area
        const filesToAdd = filesToUpdate.map(file => path.relative(projectRoot, file.path)).join(' ');
        execSync(`git add ${filesToAdd}`, { cwd: projectRoot, stdio: 'inherit' });
        
        // Commit the changes
        execSync(`git commit -m "Release v${newVersion}"`, { cwd: projectRoot, stdio: 'inherit' });
        console.log(`✅ Committed changes with message "Release v${newVersion}"`);

        // Create a new Git tag
        execSync(`git tag v${newVersion}`, { cwd: projectRoot, stdio: 'inherit' });
        console.log(`✅ Created Git tag v${newVersion}`);

    } catch (error) {
        console.error(`❌ An error occurred during Git operations: ${error.message}`);
        process.exit(1);
    }
}, 2000);