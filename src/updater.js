import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';

export async function checkForAppUpdates(onUserClick = false) {
  const update = await check();
  if (update) {
    const yes = await ask(`Chamber ${update.version} is available!\n\nRelease notes: ${update.body}`, { 
      title: 'Update Available',
      kind: 'info',
      okLabel: 'Update',
      cancelLabel: 'Cancel'
    });
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
      await relaunch();
    }
  } else if (onUserClick) {
    await message('You are on the latest version. Stay awesome!', { 
      title: 'No Update Available',
      kind: 'info',
      okLabel: 'OK'
    });
  }
}