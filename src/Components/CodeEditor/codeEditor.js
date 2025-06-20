import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

export function codeEditor(editorContainer) {

    if (!editorContainer) {
        console.error('Monaco editor container not found');
        return;
    }

    const editor = monaco.editor.create(editorContainer, {
        value: '',
        language: 'javascript',
        automaticLayout: true,
        minimap: {
          enabled: false
        },
        lineNumbersMinChars: 2
    });
    
    monaco.editor.defineTheme('transparentTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
            'editor.background': '#00000000', // fully transparent, accepted as hex
            'editor.foreground': '#f0f0f0',
            'editor.lineHighlightBackground': '#ffffff18', // soft white
            'editor.selectionBackground': '#0078d740', // soft blue
        }
    });
    monaco.editor.setTheme('transparentTheme');

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES5,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        allowNonTsExtensions: true
    });

    // Register the workers
    self.MonacoEnvironment = {
        getWorker: function (moduleId, label) {
            if (label === 'editorWorkerService') {
                return new editorWorker();
            }
            if (label === 'json') {
                return new jsonWorker();
            }
            if (label === 'css') {
                return new cssWorker();
            }
            if (label === 'html') {
                return new htmlWorker();
            }
            if (label === 'typescript' || label === 'javascript') {
                return new tsWorker();
            }
        }
    };
    customPasteMethods(editor);
    return editor;
}


function customPasteMethods(editor) {
    // electron have issue with clipboard paste, so we use custom method    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, function () {
        const clipboardData = window.electronAPI.getClipboard();
        if (clipboardData && typeof clipboardData === 'string') {
            editor.trigger('keyboard', 'type', { text: clipboardData });
        }
    });
}