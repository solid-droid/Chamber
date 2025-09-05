let store = {};

export function getSession(key){
    return store[key];
}

export function setSession(key, data){
    store[key] = data;
}

export function clearSession(key){
    delete store[key];
}