import { getExecutor } from '../Runtime/global';

export function executeCode(code, options = {}) {
 const { QJS } = getExecutor();
 let vm = QJS.newContext();
 let methodVMs = [];
 options.methods?.forEach(method => {
   const methodVM = attachAPI(vm, method.name, method.method, method.parent);
   methodVMs.push(methodVM);
 });

 const result = vm.evalCode(code);
 let output = null;
 if (result.error) {
  output = result.error.consume(vm.dump);
 } else {
  output = result.value.consume(vm.dump);
 }
 methodVMs.forEach(m => m.dispose());
 vm.dispose();
 return output;
}

export async function executeCodeAsync(code, options = {}) {
 const { QJS_async } = getExecutor();
 let vm = QJS_async.newContext();
  let methodVMs = [];
 options.methods?.forEach(method => {
   const methodVM = attachAPI(vm, method.name, method.method, method.parent);
   methodVMs.push(methodVM);
 });

 const result = await vm.evalCodeAsync(code);
 let output = null;
 if (result.error) {
  output = result.error.consume(vm.dump);
 } else {
  output = result.value.consume(vm.dump);
 }
 methodVMs.forEach(m => m.dispose());
 vm.dispose();
 return output;
}

function attachAPI(vm, name, method, parent) {
  const _method = vm.newFunction(name, (...args) => {
   const nativeArgs = args.map(vm.dump)
   return method(vm, ...nativeArgs);
  });

  vm.setProp(parent || vm.global, name, _method);
  return _method;
}

function createGlobalObject(vm, name, parent = vm.global) {
  const OBJ = vm.newObject();
  vm.setProp(parent, name, OBJ);
  return OBJ;
}

export async function testJavascript() {
  let code = `let a = testMethod('Javascript'); a;`;
  let options = {
      methods: [
       {
          name: 'testMethod',
          method: (vm, arg) => {
            return vm.newString(`WASM ${arg}`);
          }
       }
      ]
    };

  let result1 = executeCode(
    code,
    options
  );

  console.log(result1 , 'sync');

  let result2 = await executeCodeAsync(
    code,
    options
  );
  
  console.log(result2, 'async');
}