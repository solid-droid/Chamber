function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

function removeDuplicate(arr, field) {
    const seen = new Set();
    return arr.filter(item => {
        if (seen.has(item[field])) return false;
        seen.add(item.path);
        return true;
    });
}

const debounceSave = debounce((path,content) =>  {
    window.electronAPI.send('save', path, content)
}, 500);
const saveFile = (path, content) => debounceSave(path,content);

function getFormat(path) {
    if (!path || typeof path !== 'string') return 'plaintext';
    const ext = path.split('.').pop().toLowerCase();
    switch (ext) {
        case 'js':
        case 'mjs':
        case 'cjs':
            return 'javascript';
        case 'ts':
            return 'typescript';
        case 'json':
            return 'json';
        case 'css':
            return 'css';
        case 'scss':
            return 'scss';
        case 'html':
        case 'htm':
            return 'html';
        case 'xml':
            return 'xml';
        case 'md':
            return 'markdown';
        case 'py':
            return 'python';
        case 'java':
            return 'java';
        case 'cpp':
        case 'cc':
        case 'cxx':
        case 'hpp':
        case 'h':
        case 'c':
            return 'cpp';
        case 'cs':
            return 'csharp';
        case 'php':
            return 'php';
        case 'sh':
        case 'bash':
            return 'shell';
        case 'yml':
        case 'yaml':
            return 'yaml';
        case 'go':
            return 'go';
        case 'rs':
            return 'rust';
        case 'sql':
            return 'sql';
        case 'txt':
            return 'plaintext';
        default:
            return 'plaintext';
    }
}

function downloadFile(filename, content, mimeType) {
  let processedContent = content;
  mimeType = mimeType || 'application/octet-stream';

  const fileExtension = filename.split('.').pop().toLowerCase();

  switch (fileExtension) {
    case 'json':
      mimeType = 'application/json';
      if (typeof content === 'object' && content !== null) {
        processedContent = JSON.stringify(content, null, 2);
      }
      break;
    case 'txt':
      mimeType = 'text/plain';
      break;
    case 'csv':
      mimeType = 'text/csv';
      break;
    case 'html':
      mimeType = 'text/html';
      break;
    case 'xml':
      mimeType = 'application/xml';
      break;
    case 'pdf':
      mimeType = 'application/pdf';
      break;
    case 'png':
      mimeType = 'image/png';
      break;
    case 'jpg':
    case 'jpeg':
      mimeType = 'image/jpeg';
      break;
    case 'gif':
      mimeType = 'image/gif';
      break;
    default:
      console.warn(`Unknown file type: .${fileExtension}. Using default 'application/octet-stream'.`);
  }

  const finalFilename = filename.endsWith(`.${fileExtension}`) ? filename : `${filename}.${fileExtension}`;

  try {
    const blob = new Blob([processedContent], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    a.style.display = 'none'; 
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error during file download:', error);
    alert('Failed to download the file. Please try again.');
  }
}

export {
    debounce,
    removeDuplicate,
    saveFile,
    getFormat,
    downloadFile
}