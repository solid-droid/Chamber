import './UI/Atomic/Atomic-UI.css';
import { chamber, loadWindowVariables } from './Services/System/Framework/Common.js';
import { resizeWindow } from './Services/System/Framework/Tauri.js';
import { init_webcomponents } from './UI/UI.js';

(async () => {
    await loadWindowVariables();
    init_webcomponents();

    let demoMode = false;

    demoMode && import('./Sources/Demo/Main-Demo.js').then(({ Main_Demo }) => {
        resize();
        Main_Demo();
    });

    if(demoMode){
        return;
    }

    chamber().device.IsDesktop && import('./Sources/Desktop/Main-Desktop.js').then(({ Main_Desktop }) => {
        resize();
        Main_Desktop();
    });
    chamber().device.IsMobile && import('./Sources/Mobile/Main-Mobile.js').then(({ Main_Mobile }) => {
        resize();
        Main_Mobile();
    });

})();


async function resize(){
    await resizeWindow(900, 650);
    $('#Loading-Screen').fadeOut(500, function() {
        $(this).remove();
    });
}