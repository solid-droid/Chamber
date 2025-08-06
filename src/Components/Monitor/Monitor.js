import { setDevLog } from "../../Runtime/global";
import { DevLogs } from "./devLogs";

export function createMonitorLogs(element){
    let _devLogsDOM = $('<div></div>')
    $(element).append(_devLogsDOM)
    const devlogs =new DevLogs(_devLogsDOM);
    setDevLog(devlogs);
}