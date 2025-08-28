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

async function nodeJS_service(data={type:'echo', msg:'message',onMessage:()=>{}, onExit:()=>{}, onError:()=>{}}) {
    const command = Command.sidecar('binaries/app', [], {env: {ChamberMsg: JSON.stringify({type:data.type, msg:data.msg})}});
    command.stderr.on('data', line => {
        console.error(`command stderr: "${line}"`);
        data?.onError(line);
    });
    command.stdout.on('data', line => {
        data?.onMessage(line);
    });
    command.on('close', data => {
         data?.onExit(data);
     });
    const output = await command.spawn();
    return output;
}

export { 
    getWindow, 
    checkForUpdate, 
    relaunchApp,
    sysMessage,
    nodeJS_service
};