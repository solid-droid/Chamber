function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

function removeDuplicate(arr, field) {
    const seen = new Set();
    return arr.filter(item => {
        if (seen.has(item[field])) return false;
        seen.add(item.path);
        return true;
    });
}

const debounceSave = debounce((path,content) =>  {
    window.electronAPI.send('save', path, content)
}, 500);
const saveFile = (path, content) => debounceSave(path,content);

function getFormat(path) {
    if (!path || typeof path !== 'string') return 'plaintext';
    const ext = path.split('.').pop().toLowerCase();
    switch (ext) {
        case 'js':
        case 'mjs':
        case 'cjs':
            return 'javascript';
        case 'ts':
            return 'typescript';
        case 'json':
            return 'json';
        case 'css':
            return 'css';
        case 'scss':
            return 'scss';
        case 'html':
        case 'htm':
            return 'html';
        case 'xml':
            return 'xml';
        case 'md':
            return 'markdown';
        case 'py':
            return 'python';
        case 'java':
            return 'java';
        case 'cpp':
        case 'cc':
        case 'cxx':
        case 'hpp':
        case 'h':
        case 'c':
            return 'cpp';
        case 'cs':
            return 'csharp';
        case 'php':
            return 'php';
        case 'sh':
        case 'bash':
            return 'shell';
        case 'yml':
        case 'yaml':
            return 'yaml';
        case 'go':
            return 'go';
        case 'rs':
            return 'rust';
        case 'sql':
            return 'sql';
        case 'txt':
            return 'plaintext';
        default:
            return 'plaintext';
    }
}

export {
    debounce,
    removeDuplicate,
    saveFile,
    getFormat
}