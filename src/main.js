import { UI } from './UI/UI.js';
import { Store } from './Services/Framework/Store/Store.js';
import { Tauri } from './Services/Framework/Tauri/Tauri.js';
import { loadGlobals } from './Services/Framework/Globals/Globals.js';


(async () => {
    await loadGlobals();
    await UI.Canvas3D.loadGlobals();
    
    Store.theme = 'theme-dark';
    UI.init().setTheme(Store.theme);

              
    import('./Sources/app.js').then(async ({ start }) => {
        await resize();
        await start();
    });

})();


async function resize(){
    Tauri.resize(900, 650).then(() => {
        console.log('Window resized to 900x650');
    });
    $('#Loading-Screen').fadeOut(500, function() {
        $(this).remove();
    });
}