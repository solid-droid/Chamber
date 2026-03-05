/**
 * System Services Plugin (Tauri-based)
 */
export interface ITauriServices {
    import(options?: { multiple?: boolean; directory?: boolean }): Promise<string[] | string | null>;
    export(data: any, filename?: string): Promise<{ success: boolean; path?: string }>;
    notify(msg: string, options?: any, question?: boolean): Promise<boolean | void>;
}

/**
 * Sidecar Plugin (Tauri-based)
 */
export interface ITauriSidecar {
    nodeJS(data: { 
        type: string; 
        msg: string; 
        onMessage?: (line: string) => void; 
        onExit?: (code: any) => void; 
        onError?: (err: any) => void; 
    }): Promise<any>;
}

/**
 * Updater Plugin (Tauri-based)
 */
export interface ITauriUpdater {
    check(onUserClick?: boolean): Promise<ITauri>;
}

/**
 * Main Tauri API Proxy
 */
export interface ITauri {
    window: any | null;
    env: {
        isMobile: boolean;
        isTauri: boolean;
        isDev: boolean;
    };
    register(name: string, plugin: any): ITauri;
    close(): ITauri;
    minimize(): ITauri;
    resize(width: number, height: number): Promise<ITauri>;
    
    // Registered Plugins
    services?: ITauriServices;
    sidecar?: ITauriSidecar;
    updater?: ITauriUpdater;

    [key: string]: any; // Catch-all for other dynamic plugins
}