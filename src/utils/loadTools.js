import { setExecutor } from '../Runtime/global';
import { nodeJS_service } from './tauri';
let toolCheck = {quickJS: false, nodeJS_Service: false};
let error = '';
export async function loadTools(){  
  toolCheck = {quickJS: false, nodeJS_Service: false};
  try{
    //quickJS
    const quickjs = await import('../lib/quickjs');
    const QuickJSEngine = await quickjs.QJS.getQuickJS();
    setExecutor({QJS: quickjs.QJS, engine:QuickJSEngine});
    toolCheck.quickJS = true;
    //nodeJS service
    let processID = await nodeJS_service({
      type:'echo',
      msg:'test'
    }, {
      onMessage: data => {
         if(typeof data === 'object'){
            let _data = JSON.parse(data);
            if(_data?.type === 'echo'){
              toolCheck.nodeJS_Service = true;
            }
          }
      }
    })
  } catch(e){
    error = e;
  }
}

export function getToolStatus(){
  return {toolCheck, error};
}