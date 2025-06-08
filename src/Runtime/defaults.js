const icons = {
    Projects: 'fa-solid fa-hexagon-nodes',
    Canvas3D: 'fa-solid fa-video',
    Canvas2D: 'fa-solid fa-video',
    WebView: 'fa-solid fa-video',
    Audio: 'fa-solid fa-music',
    Datastore: 'fa-solid fa-database',
    Scripts: 'fa-solid fa-code',
    Agent: 'fa-solid fa-robot',

    Video: 'fa-solid fa-video',
    Scene: 'fa-solid fa-map sceneIcon',
    Camera: 'fa-solid fa-camera cameraIcon',
    Light: 'fa-solid fa-lightbulb lightIcon',
    Mesh: 'fa-solid fa-cube meshIcon',
    Material: 'fa-solid fa-palette materialIcon',
    Effects: 'fa-solid fa-magic effectsIcon',
    Animation: 'fa-solid fa-film animationIcon',
    Shaders: 'fa-solid fa-code shadersIcon',
    Textures: 'fa-solid fa-image texturesIcon',
    Bones: 'fa-solid fa-bone bonesIcon',
}

const projectDefault = [
     {name: 'main.js', path: 'main.js', type:'Project Start', fileType:'javascript', tree_meta: {icon: 'fa-solid fa-play'}},
     {name: 'config.json', path: 'config.json',  type: 'Project Config',  fileType:'json', tree_meta: { icon:'fa-solid fa-gears'}},
     {name: 'secure.env', path: 'secure.env', type:'Secure Tokens', fileType:'env', tree_meta: { icon:'fa-solid fa-gears'}},
]
const COMPONENTS = [
    {name: 'Projects', path: 'Projects' },
    {name: 'Canvas3D', path: 'Canvas3D' },
    {name: 'Canvas2D', path: 'Canvas2D'},
    {name: 'WebView', path: 'WebView'},
    {name: 'Audio', path: 'Audio'},
    {name: 'Datastore', path: 'Datastore'},        
    {name: 'Scripts', path: 'Scripts'},
    {name: 'Agent', path: 'Agent'},
]
const Canvas3D_entries = [
    {name: 'Scene', path: 'Canvas3D/Scene'},
    {name: 'Camera', path: 'Canvas3D/Camera'},
    {name: 'Light', path: 'Canvas3D/Light'},
    {name: 'Mesh', path: 'Canvas3D/Mesh'},
    {name: 'Material', path: 'Canvas3D/Material'},
    {name: 'Effects', path: 'Canvas3D/Effects'},
    {name: 'Animation', path: 'Canvas3D/Animation'},
    {name: 'Shaders', path: 'Canvas3D/Shaders'},
    {name: 'Bones', path: 'Canvas3D/Bones'},
];

const Canvas2D_entires = [
    {name: 'Network', path: 'Canvas2D/Network'},
    {name: 'Scene', path: 'Canvas2D/Scene'},
    {name: 'Camera', path: 'Canvas2D/Camera'},
    {name: 'Light', path: 'Canvas2D/Light'},
    {name: 'Mesh', path: 'Canvas2D/Mesh'},
    {name: 'Material', path: 'Canvas2D/Material'},
    {name: 'Effects', path: 'Canvas2D/Effects'},
    {name: 'Animation', path: 'Canvas2D/Animation'},
    {name: 'Shaders', path: 'Canvas2D/Shaders'},
    {name: 'Bones', path: 'Canvas2D/Bones'},
]


const WebView_entries = [
    {name: 'JSX', path: 'WebView/JSX'},
    {name: 'Media', path: 'WebView/Media'},
    {name: 'Grid', path: 'WebView/Grid'},
    {name: 'Chart', path: 'WebView/Chart'},
    {name: 'Map', path: 'WebView/Map'},
];

const Audio_entries = [
    {name: 'Instrument', path: 'Audio/Instrument'},
    {name: 'Soundtrack', path: 'Audio/Soundtrack'},
]

const Datastore_entries = [
    {name: 'Signal', path: 'Datastore/Signal'},
    {name: 'Table', path: 'Datastore/Table'},
    {name: 'Graph', path: 'Datastore/Graph'},
    {name: 'BigData', path: 'Datastore/BigData'},
    {name: 'Cookie', path: 'Datastore/Cookie'},
    {name: 'Local', path: 'Datastore/Local'},
    {name: 'Cloud', path: 'Datastore/Cloud'},
]

const Scripts_entries = [
    {name: 'Workers', path: 'Scripts/Worker'},
    {name: 'Functions', path: 'Scripts/Functions'},
    {name: 'Events', path: 'Scripts/Events'},
    {name: 'WASM', path: 'Scripts/WASM'},
    {name: 'Network', path:'Scripts/Network'}
]

const Agent_entries = [
    {name: 'Workflow ', path: 'Agent/Workflow'},
    {name: 'Transformer', path: 'Agent/Transformer'},
    {name: 'Crawler', path: 'Agent/Crawlers'},
    {name: 'Scrapper', path: 'Agent/Scrappers'},
]

const focusTypes = ['Mesh']

export {
    icons,
    projectDefault,
    COMPONENTS,
    Canvas3D_entries,
    Canvas2D_entires,
    WebView_entries,
    Audio_entries,
    Datastore_entries,
    Scripts_entries,
    Agent_entries,
    focusTypes
}