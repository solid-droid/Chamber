# CHAMBER - App Builder on Steroids

## Scripts
 - Dev mode (Desktop)  
`npm run tauri dev`
 - Dev mode (Android)  
 `npm run tauri android dev`
 - Github Actions Desktop build and publish  (Auto-updater uses github version)   
 `Add Tag version to commit`
 - build and bundle side car nodeJS  
 `npm run package:nodejs`
 - Build (Desktop)  
 `npm run tauri build`
 - Build (Android)  
 `npm tauri android build`  or  
 `npm tauri android build -- --apk` or  
 `npm tauri android build -- --apk --split-per-abi`

## UI
 - Tauri - Webview 
   - Windows (edge/chomium)
   - MacOS (WKWebView) 
   - Linux (webkit2gtk) - build FAIL
   - Android (webview)
## SideCar
 - NodeJS (sidecar)
   >Only Use if Rust is not able to handle the job
   - Desktop builds - works
       - Go to project folder - `cd Chamber`
       - To build binary(using @yao-pkg/pkg) and relocate for tauri bundling   `npm run package:nodejs`
       - For editing NodeJS code `cd Chamber/src-nodejs`  
       - Add externalBin - `"externalBin": ["binaries/app"]`
      
   - Android build - failed  
       - Not able to package with @yao-pkg/pkg  
        (Not sure of anyother way)
       - Make sure externalBin is empty  
         `cd Chamber/src-tauri/tauri.conf.json`  
         `"externalBin": [],` 
       
