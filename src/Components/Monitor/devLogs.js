import { getWorkspace } from "../../Runtime/global";
import './devLogs.css';

export class DevLogs{
    constructor(element){
        this.element = $(element);
        this.element.addClass('devLogs');
        this.loadChanges();
    }

    loadChanges(){
       this.element.empty();
       let workspace = getWorkspace().workspace;
       let logs = workspace.log();
       let branchName = $(`<div class="devLogs-branchName">Branch: ${logs.branch}</div>`)
       this.element.append(branchName);
       logs.commits.forEach((commit,i) => {
        let _commit = $(`<div data-index="${i}" class="devLogs-commit ${logs.current === i ? 'devLogs-currentCommit' : ''}">
            <span>[${i}] </span>
            <span>${commit.message}</span>
        </div>`);
        this.element.append(_commit);
       });
       $('.devLogs-commit').off('click').on('click', (e)=> {
            let index = parseInt(e.currentTarget.dataset.index);
            if(logs.current === index)return;
            getWorkspace().goToCommit(index);
            this.loadChanges();
       })
    }
}