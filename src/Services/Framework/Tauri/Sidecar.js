import { Tauri } from './Tauri.js';
import { Command } from '@tauri-apps/plugin-shell';

const Sidecar = {
    async nodeJS(data = { type: 'echo', msg: '', onMessage: () => {} }) {
        const cmd = Command.sidecar('binaries/app', [], {
            env: { ChamberMsg: JSON.stringify({ type: data.type, msg: data.msg }) }
        });
        cmd.stdout.on('data', data.onMessage);
        return await cmd.spawn();
    }
};

// --- Auto-Register ---
Tauri.register('node', Sidecar);

export default Sidecar;