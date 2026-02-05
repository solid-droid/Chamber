import './UI/UI.js';
import { chamber, loadWindowVariables } from './Services/System/Framework/Common.js';
import { resizeWindow } from './Services/System/Framework/Tauri.js';


(async () => {
    await loadWindowVariables();
    let isDesktop = chamber().device.IsDesktop;
    let isMobile = chamber().device.IsMobile;
    import('./Sources/main.js').then(async ({ start }) => {
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