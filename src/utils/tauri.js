import { getCurrentWindow } from '@tauri-apps/api/window';
import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';
import { Command } from '@tauri-apps/plugin-shell';

function getWindow() {
    return getCurrentWindow();
}

async function checkForUpdate(){
    return await check();
}

function relaunchApp() {
    return relaunch();
}

async function sysMessage(msg, options = {}, question = false) {
    if(question) {
        return await ask(msg, { 
            title: options.title,
            kind: options.kind || 'info',
            okLabel: options.okLabel || 'Yes',
            cancelLabel: options.cancelLabel || 'No'
        });
    }
    return await message(msg, { 
      title: options.title,
      kind: options.kind || 'info',
      okLabel: options.okLabel || 'OK',
      cancelLabel: options.cancelLabel || 'Cancel'
    });
}

async function sidecar(message = 'Tauri') {
    const command = Command.sidecar('binaries/app', [], {env: {ChamberMsg: message}});
    command.stderr.on('data', line => {
        console.error(`command stderr: "${line}"`)
    });
    command.stdout.on('data', line => {
        console.log(line);
    });
    command.on('close', data => {
         console.log(`command finished with code ${data.code} and signal ${data.signal}`)
     });
    const output = await command.spawn();
}

export { 
    getWindow, 
    checkForUpdate, 
    relaunchApp,
    sysMessage,
    sidecar
};