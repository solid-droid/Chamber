function generateTestTree(count = 30, ...entries) {
    const data = [];

    const createChildren = (currentLevelIndex) => {
        if (currentLevelIndex >= entries.length) {
            return [];
        }

        const currentLevelCount = entries[currentLevelIndex];
        const children = [];
        const nextLevelIndex = currentLevelIndex + 1;

        for (let j = 1; j <= currentLevelCount; j++) {
            const childNode = {
                icon: "fa-solid fa-cube",
                name: `Level${currentLevelIndex + 1}-Node${j}`,
                type: 'node'
            };

            const nextLevelChildren = createChildren(nextLevelIndex);
            
            if (nextLevelChildren.length > 0) {
                childNode.children = nextLevelChildren;
            }

            children.push(childNode);
        }

        return children;
    };


    for (let i = 1; i <= count; i++) {
        const projectName = `Project asdsa sadasdaf adsad${i}`;

        const rootChildren = createChildren(0);

        const project = {
            icon: "fa-solid fa-ticket",
            name: projectName,
            type: 'project',
            expanded: false,
            children: rootChildren
        };

        data.push(project);
    }

    return data;
}

export {
    generateTestTree
}