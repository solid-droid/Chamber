import { ITauri} from '../Tauri/types';
import { IStore } from '../Store/types';
import { ILog } from '../Log/types';
import { IUI } from '../../../UI/types';

declare global {
    // 1. External Libraries
    interface Window {
        /** jQuery / Sizzle */
        $: any;
        jQuery: any;
        /** Monaco Editor Core */
        monaco: any;

        /** Global Namespace for your Framework */
        CHAMBER: {
            Tauri: ITauri;
            UI: IUI;
            Store: IStore;
            Log: ILog;
        };

        /** Original __TAURI__ check */
        __TAURI__: {
            core: {
                invoke(cmd: string, args?: any): Promise<any>;
            };
        };

        BABYLON: any; // Babylon.js global namespace
        BABYLON_HELPER: any; // Canvas global namespace

    }

    // Allow using $ and CHAMBER directly without 'window.'
    const $: any;
    const jQuery: any;
    const monaco: any;
    const BABYLON: any;
    const CHAMBER: {
        Tauri: ITauri;
        UI: IUI;
        Store: IStore;
        Log: ILog;
    };
}

export {};