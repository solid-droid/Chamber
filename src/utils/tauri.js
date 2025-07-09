import { getCurrentWindow } from '@tauri-apps/api/window';
import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';

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

export { 
    getWindow, 
    checkForUpdate, 
    relaunchApp,
    sysMessage
};