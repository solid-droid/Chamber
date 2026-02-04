import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { check } from '@tauri-apps/plugin-updater';
import { ask, message, open } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';
import { Command } from '@tauri-apps/plugin-shell';

async function getEnvironment() {
    let isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const isDesktop = !isMobile;
    const isTauri = window.__TAURI__;

    let isDev = false;
    if (isTauri && typeof window.__TAURI__.core?.invoke === 'function') {
        try {
            isDev = await window.__TAURI__.core.invoke('is_dev_mode');
        } catch (e) {
            console.error('Failed to invoke is_dev_mode:', e);
        }
    }

    window.IsMobile = isMobile;
    window.IsDesktop = isDesktop;
    window.IsDev = isDev;
    window.tauri = isTauri;

    return {
        IsMobile: isMobile,
        IsDesktop: isDesktop,
        IsDev: isDev,
        IsTauri: isTauri
    };
}

function closeApp() {
    const appWindow = getCurrentWindow();
    appWindow.close();
}

function minimizeApp() {
    const appWindow = getCurrentWindow();
    appWindow.minimize();
}

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

async function importFile(options = {}) {
    const multiple = options.multiple ?? false;
    const directory = options.directory ?? false;
    const file = await open({
        multiple,
        directory
    });
    return file
}

async function resizeWindow(width, height) {
  try {
    const appWindow = getCurrentWindow();

    // Create a new LogicalSize object with the desired width and height
    const newSize = new LogicalSize(width, height);

    // Set the window size
    await appWindow.setSize(newSize);
    await appWindow.center();

    console.log(`Window resized to: ${width}x${height} logical pixels.`);
  } catch (error) {
    console.warn("Failed to resize window:", error);
  }
}

export { 
    getWindow, 
    closeApp,
    minimizeApp,
    checkForUpdate, 
    relaunchApp,
    sysMessage,
    nodeJS_service,
    getEnvironment,
    importFile,
    resizeWindow
};