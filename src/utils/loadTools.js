import { setExecutor } from '../Runtime/global';
import { nodeJS_service } from './tauri';
///////quickJS
import { newQuickJSAsyncWASMModule, newQuickJSWASMModuleFromVariant, newVariant, RELEASE_SYNC, RELEASE_ASYNC } from "quickjs-emscripten"
import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url"
import wasmAyncLocation from "@jitl/quickjs-wasmfile-release-asyncify/wasm?url"
const variant = newVariant(RELEASE_SYNC, {wasmLocation})
const variant_async = newVariant(RELEASE_ASYNC, {wasmLocation: wasmAyncLocation})
///////



let toolCheck = {quickJS: false, nodeJS_Service: false};
let error = '';
export async function loadTools(){  
  toolCheck = {quickJS: false, nodeJS_Service: false};
  try{
    //quickJS
    let quickJS = await newQuickJSWASMModuleFromVariant(variant);
    let quickJS_async = await newQuickJSAsyncWASMModule(variant_async);
    setExecutor({QJS: quickJS, QJS_async: quickJS_async});
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
