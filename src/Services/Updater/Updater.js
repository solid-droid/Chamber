import { checkForUpdate, relaunchApp, sysMessage } from '../Framework/Tauri';

export async function checkForAppUpdates(onUserClick = false) {
  const update = await checkForUpdate();
  if (update) {
    const yes = await sysMessage(`Chamber ${update.version} is available!\n\nRelease notes: ${update.body}`, { 
      title: 'Update Available',
      kind: 'info',
      okLabel: 'Update',
      cancelLabel: 'Cancel'
    }, true);
    if (yes) {
       let downloaded = 0;
       let contentLength = 0;  
       await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength;
            console.log(`started downloading ${event.data.contentLength} bytes`);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            console.log(`downloaded ${downloaded} from ${contentLength}`);
            break;
          case 'Finished':
            console.log('download finished');
            break;
        }
      });
      console.log('update installed');
      await relaunchApp();
    }
  } else if (onUserClick) {
    await sysMessage('You are on the latest version.', { 
      title: 'No Update Available',
      kind: 'info',
      okLabel: 'OK'
    });
  }
}