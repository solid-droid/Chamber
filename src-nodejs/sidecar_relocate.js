import { execSync } from 'child_process';
import fs from 'fs/promises';
import fssync from 'fs';
import path from 'path';

const ext = process.platform === 'win32' ? '.exe' : '';

const rustInfo = execSync('rustc -vV').toString();
const targetTriple = /host: (\S+)/g.exec(rustInfo)?.[1];

if (!targetTriple) {
  console.error('❌ Could not determine target triple');
  process.exit(1);
}

const from = `./src-nodejs/app${ext}`;
const to = `./src-tauri/binaries/app-${targetTriple}${ext}`;

await fs.mkdir(path.dirname(to), { recursive: true });

fssync.renameSync(from, to);
console.log(`✅ Renamed ${from} → ${to}`);