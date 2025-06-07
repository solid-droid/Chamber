/**
 * JSONVersioning - Lightweight Git-like version control for JSON objects.
 * Supports: commits (with diff), undo/redo, branching, merging, squashing, and serialization.
 * Now supports fine-grained string-level diffs (toggleable per commit).
 */

import { diff_match_patch } from 'diff-match-patch';

export class JSONVersioning {
    constructor(versionFile = null) {
        this.dmp = new diff_match_patch();
        if (versionFile) {
            this.setVersionFile(versionFile);
        } else {
            const initialData = {};
            this.branches = {
                main: [{ full: JSON.parse(JSON.stringify(initialData)), message: "Initial commit", timestamp: Date.now() }]
            };
            this.currentBranch = "main";
            this.currentIndex = 0;
        }
    }

    // --- State Accessors ---

    get currentCommit() {
        return this.branches[this.currentBranch][this.currentIndex];
    }

    get currentData() {
        const branch = this.branches[this.currentBranch];
        let state = JSON.parse(JSON.stringify(branch[0].full));
        for (let i = 1; i <= this.currentIndex; i++) {
            state = this.applyDiff(state, branch[i].diff);
        }
        return state;
    }

    getData() {
        return this.currentData;
    }

    // --- Core Versioning ---

    commit(message = null, newData = null, options = { stringDiff: false }) {
        const branch = this.branches[this.currentBranch];
        const current = this.currentData;
        const dataToCommit = newData ? JSON.parse(JSON.stringify(newData)) : current;
        const diff = this.diff(current, dataToCommit, options);

        if (Object.keys(diff).length === 0) return;

        const autoMessage = message || this.autoGenerateCommitMessage(diff);
        branch.splice(this.currentIndex + 1);
        branch.push({ diff, message: autoMessage, timestamp: Date.now(), options });
        this.currentIndex++;
    }

    undo() {
        if (this.currentIndex > 0) this.currentIndex--;
    }

    redo() {
        const branch = this.branches[this.currentBranch];
        if (this.currentIndex < branch.length - 1) this.currentIndex++;
    }

    // --- Branching ---

    createBranch(name) {
        if (this.branches[name]) throw new Error("Branch already exists");
        const full = this.currentData;
        this.branches[name] = [{ full: JSON.parse(JSON.stringify(full)), message: `Initial branch from ${this.currentBranch}`, timestamp: Date.now() }];
    }

    checkout(name) {
        if (!this.branches[name]) throw new Error("Branch does not exist");
        this.currentBranch = name;
        this.currentIndex = this.branches[name].length - 1;
    }

    // --- Merge and Squash ---

    merge(fromBranch) {
        if (!this.branches[fromBranch]) throw new Error("Branch does not exist");

        const fromData = this._getData(fromBranch);
        const targetData = this.currentData;
        const merged = this.deepMerge(targetData, fromData);

        this.commit(`Merged from ${fromBranch}`, merged);
    }

    squashToLastCommit(allBranches = false) {
        const squashBranch = (branch) => {
            const data = this._getData(branch);
            const lastMessage = this.branches[branch].at(-1).message;
            this.branches[branch] = [{ full: data, message: `Squashed: ${lastMessage}`, timestamp: Date.now() }];
        };

        if (allBranches) {
            for (let branch in this.branches) squashBranch(branch);
            this.currentIndex = 0;
        } else {
            squashBranch(this.currentBranch);
            this.currentIndex = 0;
        }
    }

    // --- Serialization ---

    getVersionFile() {
        return {
            currentBranch: this.currentBranch,
            currentIndex: this.currentIndex,
            branches: this.branches
        };
    }

    setVersionFile(versionFile) {
        if(!versionFile)
            return;
        this.currentBranch = versionFile.currentBranch;
        this.currentIndex = versionFile.currentIndex;
        this.branches = versionFile.branches;
    }

    // --- Utilities ---

    log() {
        const branch = this.branches[this.currentBranch];
        console.log(`Branch: ${this.currentBranch}`);
        branch.forEach((commit, index) => {
            const prefix = (index === this.currentIndex) ? '👉' : '  ';
            const time = new Date(commit.timestamp).toLocaleString();
            console.log(`${prefix} [${index}] ${commit.message} (${time})`);
        });
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
        const branch = this.branches[branchName];
        let state = JSON.parse(JSON.stringify(branch[0].full));
        for (let i = 1; i < branch.length; i++) {
            state = this.applyDiff(state, branch[i].diff);
        }
        return state;
    }

    // --- Diffing Engine ---

    diff(oldObj, newObj, options = { stringDiff: false }) {
        const result = {};
        for (const key in newObj) {
            if (!(key in oldObj)) {
                result[key] = newObj[key];
            } else if (typeof newObj[key] === 'object' && typeof oldObj[key] === 'object') {
                const deepDiff = this.diff(oldObj[key], newObj[key], options);
                if (Object.keys(deepDiff).length) result[key] = deepDiff;
            } else if (typeof newObj[key] === 'string' && typeof oldObj[key] === 'string' && options.stringDiff) {
                const diffs = this.dmp.diff_main(oldObj[key], newObj[key]);
                this.dmp.diff_cleanupSemantic(diffs);
                result[key] = { __stringDiff__: diffs };
            } else if (newObj[key] !== oldObj[key]) {
                result[key] = newObj[key];
            }
        }
        for (const key in oldObj) {
            if (!(key in newObj)) result[key] = null;
        }
        return result;
    }

    applyDiff(obj, diff) {
        const clone = JSON.parse(JSON.stringify(obj));
        for (const key in diff) {
            if (diff[key] === null) {
                delete clone[key];
            } else if (typeof diff[key] === 'object' && key in clone && typeof clone[key] === 'object' && !('__stringDiff__' in diff[key])) {
                clone[key] = this.applyDiff(clone[key], diff[key]);
            } else if (typeof diff[key] === 'object' && '__stringDiff__' in diff[key]) {
                const patch = this.dmp.patch_make(clone[key], diff[key].__stringDiff__);
                const [result] = this.dmp.patch_apply(patch, clone[key]);
                clone[key] = result;
            } else {
                clone[key] = diff[key];
            }
        }
        return clone;
    }

    deepMerge(target, source) {
        const result = { ...target };
        for (let key in source) {
            if (source[key] instanceof Object && key in result) {
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
}

function ExampleApp(){
        // --- Example Usage ---

    const versioner = new JSONVersioning();

    versioner.commit("Add name", { name: "Alice" });
    versioner.commit("Add age", { name: "Alice", age: 30 });
    versioner.undo();
    versioner.redo();

    versioner.createBranch("dev");
    versioner.checkout("dev");
    versioner.commit("Add role", { name: "Alice", age: 30, role: "Engineer" });

    versioner.checkout("main");
    versioner.merge("dev");

    versioner.squashToLastCommit();

    const file = versioner.getData(); // current file content
    const versionFile = versioner.getVersionFile(); // export all versioning

    const newVersioner = new JSONVersioning(versionFile); // load from file
    newVersioner.log();

    console.log("All commits:", newVersioner.getCommitList());
    newVersioner.gotoCommit(0); // jump to specific commit by ID
    console.log("After jumping to commit 0:", newVersioner.getData());


    const diffCommit = versioner.diffCommits(0, 2, "main");
    console.log("Diff between commit 0 and 2 on main branch:", diffCommit);

    // Diff between latest commits on main and feature branches
    const diffBranches = versioner.diffBranches("main", "feature");
    console.log("Diff between main and feature branch heads:", diffBranches);

    const oldData = {
        name: "Alice",
        age: 30,
        address: {
            city: "NY",
            zip: "10001",
        },
    };

    const newData = {
        name: "Alice",
        age: 31,
        address: {
            city: "Boston",
        },
        role: "Engineer",
    };

    const diff = versioner.diff(oldData, newData);
    versioner.prettyPrintDiff(diff);
}