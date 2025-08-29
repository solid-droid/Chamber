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
 `npm run tauri android build`  or  
 `npm run tauri android build -- --apk` or  
 `npm run tauri android build -- --apk --split-per-abi`

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
       
## Errors and solutions/workaround
- Binaries not found error 
    - Android Build with sidecar - wont work  
       quick fix -> remove externalBin from tauri.conf.json

- symlinking/build error 
  - Run CMD as administrator  

- github actions errors
  - vite/UI build error - import failed  
  ` Git registring folder case is messed up`  
  ` mv folders to a temp folder > commit > move back and commit`  
  ---
  - Failed to read key from store "/home/runner/work/_temp/keystore.jks": Tag number over 30 is not supported  
  `check "java -version"`  
  `make sure to use JDK 17 to generate keystore`