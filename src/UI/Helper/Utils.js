function debounce(func, delay){
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

function findDeep(value, path){
    let target = value?.children?.find(x => x.label === path[0]) || null;
    if (!target) return null;

    path = path.slice(1)
    if(!path.length)
        return target;
    return findDeep(target, path);
}

function generateMap(mapField , tree = [], map = {}, path=null){
    tree.forEach(item => {
        let _path = path ? path + '/' + item[mapField] : item[mapField];
        map[_path] = item;
        if(item.children){
            generateMap(mapField, item.children, map, _path);
        }
    });
    return map;
}

export {
    debounce,
    findDeep,
    generateMap
}