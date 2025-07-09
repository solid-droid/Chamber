export function buildTree(data, fillNode, oldTreeMap, _workspace) {
    const tree = [];
    const treeMap = {};
    let selectedNodePath = null;
    for (const item of data) {
        const parts = item.path.split('/');
        let currentLevel = tree;
        let currentPath = '';

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            let existingNode = treeMap[currentPath];

            if (!existingNode) {
                existingNode = {
                    ...item,
                    name: i === parts.length - 1 ? item.name : part,
                    path: currentPath,
                    children: []
                };
                currentLevel.push(existingNode);
                treeMap[currentPath] = existingNode;
            }
            const oldNode = oldTreeMap?.[existingNode.path];
            existingNode.tree_meta = oldNode?.tree_meta || existingNode.tree_meta || {};
            selectedNodePath = existingNode.tree_meta.selected ? existingNode.path : selectedNodePath; 
            existingNode = fillNode(parts, existingNode , i, _workspace);
            currentLevel = existingNode.children;
        }
    }
    return {tree,treeMap,selectedNodePath};
}


export function findNode(path, tree) {
    if (!path || typeof path !== 'string' || !tree || !Array.isArray(tree)) {
        console.error("Invalid input for findNode: path must be a string and tree must be an array.");
        return { parentNode: null, node: null };
    }

    // Handle root level nodes
    const rootNode = tree.find(node => node.path === path);
    if (rootNode) {
        return { parentNode: tree, node: rootNode }; // parentNode is the root array itself
    }

    // Recursively search for the node and its parent in nested levels
    function searchRecursive(nodes, targetPath, parent = null) {
        for (const node of nodes) {
            if (node.path === targetPath) {
                return { parentNode: parent, node: node };
            }
            if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                // Optimization: Check if the target path could possibly be a child of this node
                // (e.g., if targetPath starts with node.path + '/')
                if (targetPath.startsWith(`${node.path}/`)) {
                    const found = searchRecursive(node.children, targetPath, node);
                    if (found.node) {
                        return found;
                    }
                }
            }
        }
        return { parentNode: null, node: null };
    }

    return searchRecursive(tree, path);
}


