/**
 * Reactive State Store Proxy
 */
export interface IStore {
    subscribe(key: string, callback: (newVal: any, oldVal: any) => void): () => void;
    clear(): IStore;
    [key: string]: any; // Allows Store.theme, Store.user, etc.
}