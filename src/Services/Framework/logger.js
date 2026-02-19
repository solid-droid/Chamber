function log(message, type='info') {
    if(type === 'info') {
        console.log(`[INFO]: ${message}`);
    } else if(type === 'error') {
        console.error(`[ERROR]: ${message}`);
    } else if(type === 'warn') {
        console.warn(`[WARN]: ${message}`);
    } else {
        console.log(`[LOG]: ${message}`);
    }
}

export { log };