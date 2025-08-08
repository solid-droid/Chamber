import { getExecutor } from '../Runtime/global';

export function executeCode(code = '') {
    return getExecutor().engine.evalCode(code);
}
