import './UI/UI.js';
import { loadGlobals } from './Services/Framework/Common.js';
import { resizeWindow } from './Services/Framework/Tauri.js';


(async () => {
    await loadGlobals();
    let isDesktop = CHAMBER.device.IsDesktop;
    let isMobile = CHAMBER.device.IsMobile;
    import('./Sources/app.js').then(async ({ start }) => {
        await resize();
        await start();
    });
})();


async function resize(){
    await resizeWindow(900, 650);
    $('#Loading-Screen').fadeOut(500, function() {
        $(this).remove();
    });
}