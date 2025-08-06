export class JsonVersioning {
    constructor(versionFile = null) {
        if (versionFile) {
            this.setVersionFile(versionFile);
        } else {
            const initialData = {};
            this.branches = {
                main: [{ full: JSON.parse(JSON.stringify(initialData)), message: "Initial commit", timestamp: Date.now(), save: true, tag: null }]
            };
            this.currentBranch = "main";
            this.currentIndex = 0;
        }
    }

    get currentCommit() {
        return this.branches[this.currentBranch][this.currentIndex];
    }

    get currentData() {
        return this._getDataAtIndex(this.currentIndex, this.currentBranch);
    }

    getData() {
        return JSON.parse(JSON.stringify(this.currentData));
    }

    getDataAtCommit(id, branchName = this.currentBranch) {
        if (!this.branches[branchName] || id < 0 || id >= this.branches[branchName].length) {
            throw new Error("Invalid branch or commit ID");
        }
        return this._getDataAtIndex(id, branchName);
    }

    _getDataAtIndex(index, branchName) {
        const branch = this.branches[branchName];
        let state = JSON.parse(JSON.stringify(branch[0].full));
        for (let i = 1; i <= index; i++) {
            state = this.applyDiff(state, branch[i].diff);
        }
        return state;
    }

    commit(message = null, newData = null, options = { stringDiff: false, save: false, tag: null, saveByTag: false }) {
        options ??= {};
        options.stringDiff = options.stringDiff ?? false;
        options.save = options.save ?? false;
        options.tag = options.tag ?? null;
        options.saveByTag = options.saveByTag ?? false;

        const current = JSON.parse(JSON.stringify(this.currentData));
        const dataToCommit = newData ? JSON.parse(JSON.stringify(newData)) : current;
        const diff = this.diff(current, dataToCommit, options);

        if (Object.keys(diff).length === 0) return;

        const autoMessage = message || this.autoGenerateCommitMessage(diff);
        const branch = this.branches[this.currentBranch];

        branch.splice(this.currentIndex + 1);

        const commit = { diff, message: autoMessage, timestamp: Date.now(), options, save: options.save, tag: options.tag };
        branch.push(commit);
        this.currentIndex++;

        if (options.save) this._squashFalseCommits(options);
    }

    updateByPath(path, value, options = { save: false, stringDiff: false }) {
        const data = this.getData();
        data[path] = value;
        this.commit(`Updated ${path}`, data, options);
    }

    deleteByPath(path, options = { save: false }) {
        const data = this.getData();
        delete data[path];
        this.commit(`Deleted ${path}`, data, options);
    }

    get(path) {
        return this.getData()[path];
    }

    getParent(path) {
        if (!path) return undefined;
        const parentPath = path.split('/').slice(0, -1).join('/');
        return this.getData()[parentPath];
    }

    update(node, msg, stringDiff = false) {
        const data = this.getData();
        data[node.path] = node;
        this.commit(msg, data, { stringDiff });
    }

    delete(node) {
        const data = this.getData();
        delete data[node.path];
        this.commit(`Deleted ${node.path}`, data);
    }

    _squashFalseCommits(saveOptions = {}) {
        const branch = this.branches[this.currentBranch];
        const trueCommits = [branch[0]];
        let state = JSON.parse(JSON.stringify(branch[0].full));

        for (let i = 1; i < branch.length; i++) {
            const commit = branch[i];
            state = this.applyDiff(state, commit.diff);

            if (commit.save) {
                if (!saveOptions.saveByTag || commit.tag === saveOptions.tag) {
                    const prevState = this._getDataFromCommitList(trueCommits);
                    const squashedDiff = this.diff(prevState, state, commit.options);
                    trueCommits.push({
                        diff: squashedDiff,
                        message: commit.message,
                        timestamp: commit.timestamp,
                        options: commit.options,
                        save: true,
                        tag: commit.tag
                    });
                } else {
                    trueCommits.push(commit);
                }
            }
        }

        trueCommits[0] = {
            full: JSON.parse(JSON.stringify(this._getDataFromCommitList(trueCommits))),
            message: trueCommits[0].message,
            timestamp: trueCommits[0].timestamp,
            save: true,
            tag: trueCommits[0].tag
        };
        for (let i = 1; i < trueCommits.length; i++) {
            delete trueCommits[i].full;
        }

        this.branches[this.currentBranch] = trueCommits;
        this.currentIndex = trueCommits.length - 1;
    }

    _getDataFromCommitList(commitList) {
        let state = JSON.parse(JSON.stringify(commitList[0].full));
        for (let i = 1; i < commitList.length; i++) {
            state = this.applyDiff(state, commitList[i].diff);
        }
        return state;
    }

    undo() {
        if (this.currentIndex > 0) this.currentIndex--;
    }

    redo() {
        const branch = this.branches[this.currentBranch];
        if (this.currentIndex < branch.length - 1) this.currentIndex++;
    }

    createBranch(name) {
        if (this.branches[name]) throw new Error("Branch already exists");
        const full = this.currentData;
        this.branches[name] = [{ full: JSON.parse(JSON.stringify(full)), message: `Initial branch from ${this.currentBranch}`, timestamp: Date.now(), save: true, tag: null }];
    }

    checkout(name) {
        if (!this.branches[name]) throw new Error("Branch does not exist");
        this.currentBranch = name;
        this.currentIndex = this.branches[name].length - 1;
    }

    merge(fromBranch) {
        if (!this.branches[fromBranch]) throw new Error("Branch does not exist");

        const fromData = this._getData(fromBranch);
        const targetData = this.currentData;
        const merged = this.deepMerge(targetData, fromData);

        this.commit(`Merged from ${fromBranch}`, merged, { save: true });
    }

    squashToLastCommit(allBranches = false) {
        const squashBranch = (branchName) => {
            const data = this._getData(branchName);
            const lastMessage = this.branches[branchName].at(-1).message;
            this.branches[branchName] = [{ full: data, message: `Squashed: ${lastMessage}`, timestamp: Date.now(), save: true, tag: null }];
        };

        if (allBranches) {
            for (let branch in this.branches) {
                squashBranch(branch);
            }
            this.currentIndex = 0;
        } else {
            squashBranch(this.currentBranch);
            this.currentIndex = 0;
        }
    }

    getVersionFile() {
        return {
            currentBranch: this.currentBranch,
            currentIndex: this.currentIndex,
            branches: this.branches
        };
    }

    setVersionFile(versionFile) {
        this.currentBranch = versionFile.currentBranch;
        this.currentIndex = versionFile.currentIndex;
        this.branches = versionFile.branches;
    }

    log() {
        const branch = this.branches[this.currentBranch];
        return {branch: this.currentBranch, commits: branch, current: this.currentIndex}
    }

    getCommitList(branchName = this.currentBranch) {
        return this.branches[branchName].map((commit, id) => ({ id, message: commit.message }));
    }

    gotoCommit(id) {
        const branch = this.branches[this.currentBranch];
        if (id < 0 || id >= branch.length) throw new Error("Invalid commit ID");
        this.currentIndex = id;
    }

    _getData(branchName) {
        return this._getDataAtIndex(this.branches[branchName].length - 1, branchName);
    }

    diff(oldObj, newObj, options = { stringDiff: false }) {
        const result = {};
        for (const key in newObj) {
            if (!(key in oldObj)) {
                result[key] = newObj[key];
            } else if (typeof newObj[key] === 'object' && typeof oldObj[key] === 'object' && newObj[key] !== null && oldObj[key] !== null) {
                const deepDiff = this.diff(oldObj[key], newObj[key], options);
                if (Object.keys(deepDiff).length) result[key] = deepDiff;
            } else if (newObj[key] !== oldObj[key]) {
                if (options.stringDiff && typeof oldObj[key] === 'string' && typeof newObj[key] === 'string') {
                    const s1 = oldObj[key];
                    const s2 = newObj[key];
                    let prefix = 0;
                    while (prefix < s1.length && prefix < s2.length && s1[prefix] === s2[prefix]) prefix++;
                    let suffix = 0;
                    while (suffix + prefix < s1.length && suffix + prefix < s2.length && s1[s1.length - 1 - suffix] === s2[s2.length - 1 - suffix]) suffix++;

                    const removed = s1.slice(prefix, s1.length - suffix);
                    const added = s2.slice(prefix, s2.length - suffix);
                    // Optimized string diff format: store prefix length, removed string, added string, and suffix length.
                    result[key] = { __diff: { pLen: prefix, r: removed, a: added, sLen: suffix } };
                } else {
                    result[key] = newObj[key];
                }
            }
        }
        for (const key in oldObj) {
            if (!(key in newObj)) {
                result[key] = null;
            }
        }
        return result;
    }

    applyDiff(obj, diff) {
        const clone = JSON.parse(JSON.stringify(obj));
        for (const key in diff) {
            if (diff[key] === null) {
                delete clone[key];
            } else if (typeof diff[key] === 'object' && '__diff' in diff[key]) {
                // Deconstruct the optimized string diff object
                const { pLen, r, a, sLen } = diff[key].__diff;
                // Reconstruct the string using the original object's prefix and suffix parts, and the diff's added string.
                clone[key] = obj[key].slice(0, pLen) + a + obj[key].slice(obj[key].length - sLen);
            } else if (typeof diff[key] === 'object' && key in clone && typeof clone[key] === 'object') {
                clone[key] = this.applyDiff(clone[key], diff[key]);
            } else {
                clone[key] = diff[key];
            }
        }
        return clone;
    }

    deepMerge(target, source) {
        const result = { ...target };
        for (let key in source) {
            if (source[key] instanceof Object && key in result && result[key] instanceof Object) {
                result[key] = this.deepMerge(result[key], source[key]);
            } else {
                result[key] = JSON.parse(JSON.stringify(source[key]));
            }
        }
        return result;
    }

    autoGenerateCommitMessage(diff) {
        const keys = Object.keys(diff);
        return `Auto: changed ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
    }

    getDiffBetweenCommits(id1, id2, branchName = this.currentBranch) {
        const data1 = this.getDataAtCommit(id1, branchName);
        const data2 = this.getDataAtCommit(id2, branchName);
        return this.diff(data1, data2);
    }

    patchInto(workspace) {
        workspace.getData = () => this.getData();
        workspace.get = (path) => this.get(path);
        workspace.getParent = (path) => this.getParent(path);
        workspace.update = (node, msg, stringDiff = false) => {
            let data = this.getData();
            data[node.path] = node;
            this.commit(msg, data, { stringDiff });
        };
        workspace.delete = (node) => {
            let data = this.getData();
            delete data[node.path];
            this.commit(`Deleted ${node.path}`, data);
        };
    }

    revertToSavedCommit(tag = null, branchName = this.currentBranch) {
        const commits = this.branches[branchName];
        for (let i = commits.length - 1; i >= 0; i--) {
            const commit = commits[i];
            if (commit.save && (tag === null || commit.tag === tag)) {
                this.currentIndex = i;
                return;
            }
        }
        throw new Error("No matching saved commit found");
    }
}
