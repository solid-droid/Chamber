// types.d.ts

/**
 * Common return type for chainable methods
 */
type Chainable<T> = T;

/**
 * 3D Engine Plugin
 */
export interface ICanvas3D {
    engine: any | null;
    instance: any | null;
    loadGlobals(): Promise<ICanvas3D>;
    canvas(selector: string): ICanvas3D;
}

/**
 * Main UI API Proxy
 */
export interface IUI {
    selector: string;
    theme: string;
    init(selector: string): IUI;
    setTheme(theme: string): IUI;
    register(name: string, plugin: any): IUI;
    
    // Registered Plugins
    Canvas3D?: ICanvas3D;
    [key: string]: any; // Catch-all for other dynamic plugins
}
