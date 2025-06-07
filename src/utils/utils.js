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

export {
    debounce,
    removeDuplicate,
    saveFile
}