import './UI/Atomic/Atomic-UI.css';
import { chamber, loadWindowVariables } from './Services/System/Framework/Common.js';

(async () => {
    await loadWindowVariables();
    chamber().device.IsDesktop && import('./Sources/Main-Desktop.js').then(({ Main_Desktop }) => {
        //Desktop chamber editor and appViewer
        Main_Desktop();
    });
    chamber().device.IsMobile && import('./Sources/Main-Mobile.js').then(({ Main_Mobile }) => {
        // Mobile chamber editor and appViewer
        Main_Mobile();
    });

})();
