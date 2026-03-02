```json
{

  //@meta - info about the widget
  "@meta": { 
    "Ref": "@widget/<widgetHandle1>", //widget handle
    "name": "<widgetName>",
    "description":"<widgetDescription>",

    //UI boundaries///
    //helpful for design time layouting and auto layouting
    "css":{
      "minWidth":"10px",
      "maxWidth":"100px",
      "minHeight":"10px",
      "maxHeight":"100px",
      "overflow-x":"auto",
      "overflow-y":"auto",
    }    
  },

  //@configs - general configurations
  "@config":{
      // calls @unbind on appClose - Usefull for "Cleanup/Save before quitting the app" -
      "critical_teardown": true, 
  },

  //@design - @design RAR files includes meta and actual content or src-path =>
  //@design - can have - assets like 3dmodels, audio, etc.. or templates like html,css, etc... or other types
  "@design": [
    //RAR Assets
    { "Ref": "@design/<design1>" },
    { "Ref": "@design/<design2>" },
    { "Ref": "@design/<design3>" }
  ],

  //@widgets - widget RAR files includes widget details (This file is a @widget)
  "@widgets": [
    //RAR Widgets
    { "Ref": "@widgets/<widget1>" },
    { "Ref": "@widgets/<widget2>" }
  ],

  // (js, py, rust, shader, etc.. ), (local/cloud/distributed, etc..), (WASM, mainThread, workerThread, etc..)
  "@scripts":[
    //@pulse - these are scheduled scripts to execute at certain frequncies. pulse can be changed from script.
    // express - 120hz , fast - 60hz, normal - 10hz, background - 0.2 hz, idle: 0hz
    {"Ref":"@scripts/<script1>", "@language":"javascript", "@pulse":"fast"},  //laguage is javascript by default, if not specified
    {"Ref":"@scripts/<script2>", "@language":"javascript", "@pulse":"express"}, //pulse is idle by default
    {"Ref":"@scripts/<script3>", "@language":"javascript", "@pulse":"background"},
  
    //Sanbox -> tells the engine - this code can run in a sandbox or a different thread
    //@sandbox - thread => on a different thread
    //@sandbox - cloud  => run on cloud instance
    //@sandbox - distibute => run on multiple devices - cloud or local in a distributed way
    //@sandbox - wasm => runs on WASM local instance 
    {"Ref":"@scripts/<script5>", "@language":"javascript", "@execute":"sandbox" , "@sandbox":"thread"}
    
    //@imports are supports scripts
    {"Ref":"@scripts/<script6>", "@language":"javascript", "@import":"<importHandle>"} //to import everything
    {"Ref":"@scripts/<script7>", "@language":"javascript", "@import":["<importMethod1>, <importMethod2>"]}//to import just few functions (dynamic import)
  ],

  //widget Life cycle
  "@preflight": {"Ref": "@scripts/<script8>"}, //@preflight - return true if all good (true if no script linked)
  "@bind": {"Ref":"@scripts/<script9>"}, // initialize the widget
  "@suspend":{"Ref":"@scripts/<script10>"}, //creates place holder and unbinds to suspend the widget to save memory 
  "@focus": {"Ref":"@scripts/<script11>"}, //onFocus
  "@blur": {"Ref":"@scripts/<script12>"}, //onBlur
  "@resume": {"Ref":"@scripts/<script13>"}, //can be same as @bind - engine internally uses the suspended slots
  "@unbind": {"Ref":"@scripts/<script14>"}, //to destroy the widget

  //@events are exposed methods
  "@event":{
    "<eventHandleName>":{"Ref":"@scripts/<script15>", "active":true}
  },

  //@inputs - hardware input action binding
  "@inputs":{
    //@input or global hardware input details are stored in @input RAR file - widgets uses an input action binder 
    //@input have an exposed method to make it active or not
    //Trigger the folowing script on @input event trigger
    "<inputAction1>":{"Ref":"@scripts/<script16>", "active": true, "consume":true}
  },



  //@States - states are stored in global stores but uses reference 
  // -> @widget/<widgetRef>/@state= {health: {"value": 100, "meta":{"reactive": true , "type":"number"}}, isHacked: {... } , ...}
  //supports .get, .set, .subscribe, .unsubscribe
  "@state": {
    //payload and state variables are handled here    
    "health": { 
                "value": 100, 
                "meta":{
                  "reactive":true, //reactive is an engine level flag to prevent subscriptions or event triggers. (false -> uses arrayBuffer internally)
                  "required":false,
                  "type":"number"
                }
              },
    "isHacked": { 
                "meta":{
                  "reactive":true, 
                  "required":false, //required field can act as a way to convey the engine, this field must have some value on initialization (if default not added)
                  "type":"number" //type field is an optional meta field for type stric values, if not defined it will use "any" type.
                }
              },
  },

  //@instance - is generated during runtime//////////
  "@instance": { 

    //reference of the created instance of the widget
    "Ref": "@instance/#1/@widget/<widgetHandle1>",
    "parentRef": "@instance/#1/@widget/<widgetHandle2>",

    //registy of all child instances
    "registry": {
      "widgets": {
        "@widget/<widget1>": ["@instance/#1", "@instance/#2"],
        "@widget/<widget2>": ["@instance/#1", "@instance/#2"],
      },
      "designs": {
        "@assets/<design1>": ["@instance/#1", "@instance/#2"],
        "@assets/<design2>": ["@instance/#1"],
      }
    }
  }
}
```