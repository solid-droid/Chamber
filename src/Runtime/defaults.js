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
    {name: 'Projects', path: 'Projects', title:'Project Entry Point'},
    {name: 'Scripts', path: 'Scripts', title:'Script Files'},
    {name: 'Datastore', path: 'Datastore', title:'Data Management'},
    {name: 'Automation', path: 'Automation', title:'Automation'},
    {name: 'WebView', path: 'WebView', title:'Web View'},
    {name: 'Audio', path: 'Audio', title:'Audio Processing'},
    {name: 'Canvas3D', path: 'Canvas3D', title:'3D Canvas'},
    {name: 'Canvas2D', path: 'Canvas2D', title:'2D Canvas'},
]
const Canvas3D_entries = [
    {name: 'Scene3D', path: 'Canvas3D/Scene3D', title:'Scene is the root container for all 3D objects'},
    {name: 'Camera3D', path: 'Canvas3D/Camera3D', title: 'Camera defines the viewpoint and perspective of the 3D scene'},
    {name: 'Light3D', path: 'Canvas3D/Light3D', title: 'Light is used to illuminate the 3D scene'},
    {name: 'Mesh3D', path: 'Canvas3D/Mesh3D', title: 'Mesh is a 3D object made up of vertices, edges, and faces'},
    {name: 'Material3D', path: 'Canvas3D/Material3D', title: 'Material defines the appearance of a 3D object'},
    {name: 'Fx3D', path: 'Canvas3D/Fx3D', title: 'Fx3D are entities that add special effects to 3D objects'},
    {name: 'Animation3D', path: 'Canvas3D/Animation3D', title: 'Animation is used to create movement and transformations of 3D objects'},
    {name: 'Shaders3D', path: 'Canvas3D/Shaders3D', title: 'Shaders are programs that run on the GPU to control the rendering of 3D objects'},
    {name: 'Bones3D', path: 'Canvas3D/Bones3D', title: 'Bones are used to create skeletal animations for 3D models'},
];

const Canvas2D_entries = [
    {name: 'Scene2D', path: 'Canvas2D/Scene2D', title: 'Scene is the root container for all 2D objects'},
    {name: 'Camera2D', path: 'Canvas2D/Camera2D', title: 'Camera defines the viewpoint and perspective of the 2D scene'},
    {name: 'Light2D', path: 'Canvas2D/Light2D', title: 'Light is used to illuminate the 2D scene'},
    {name: 'Mesh2D', path: 'Canvas2D/Mesh2D', title: 'Mesh is a 2D object made up of vertices and edges'},
    {name: 'Material2D', path: 'Canvas2D/Material2D', title: 'Material defines the appearance of a 2D object'},
    {name: 'Fx2D', path: 'Canvas2D/Fx2D', title: 'Fx2D are entities that add special effects to 2D objects'},
    {name: 'Animation2D', path: 'Canvas2D/Animation2D', title: 'Animation is used to create movement and transformations of 2D objects'},
    {name: 'Shaders2D', path: 'Canvas2D/Shaders2D', title: 'Shaders are programs that run on the GPU to control the rendering of 2D objects'},
    {name: 'Bones2D', path: 'Canvas2D/Bones2D', title: 'Bones are used to create skeletal animations for 2D models'},
]


const WebView_entries = [
    {name: 'UI', path: 'WebView/UI' , title:'UI is the user interface for the web view'}, //HTML + CSS + JavaScript content
    {name: 'Grid', path: 'WebView/Grid' , title:'Grid is a table widget for displaying data'}, //Table widget (data grids, etc...)
    {name: 'Chart', path: 'WebView/Chart', title:'Chart is a widget for displaying data visualizations'}, //chart widgets (bar, line, pie, etc...)
    {name: 'Canvas2D', path: 'WebView/Canvas2D', title:'Canvas2D is a 2D drawing surface to embed 2D content'}, //2D drawing surface
    {name: 'Canvas3D', path: 'WebView/Canvas3D', title:'Canvas3D is a 3D drawing surface to embed 3D content'}, //3D drawing surface
    {name: 'Player', path: 'WebView/Player', title:'Player is a widget for playing media content'}, // player (video, audio, etc...)
    {name: 'Map', path: 'WebView/Map', title:'Map is a widget for displaying interactive maps'}, //interactive maps
];

const Audio_entries = [
    {name: 'Instrument', path: 'Audio/Instrument', title: 'Instrument is a category for synthesizers, samplers, and other sound sources'},
    {name: 'Mixer', path: 'Audio/Mixer', title: 'Mixer is a mixing console for adjusting volume, pan, and effects'}, 
    {name: 'Master', path: 'Audio/Master', title: 'Master is for mastering effects like compression and EQ'}, 
    {name: 'Recorder', path: 'Audio/Recorder', title: 'Recorder is for audio recording from microphone or line-in'}, 
    {name: 'Vocal', path: 'Audio/Vocal', title: 'Vocal is for processing vocals with effects like auto-tune and reverb'}, 
    {name: 'FxAudio', path: 'Audio/FxAudio', title: 'FX is for sound effects like reverb, delay, and distortion'},
    {name: 'Sound', path: 'Audio/Sound', title: 'Sound is for sound effects like UI sounds, footsteps, thunder, etc...'}, 
    {name: 'Spatial', path: 'Audio/Spatial', title: 'Spatial is for 3D audio positioning and effects'}, 
    {name: 'Ambience', path: 'Audio/Ambience', title: 'Ambience is for background sounds like wind and rain'},
    {name: 'Soundtrack', path: 'Audio/Soundtrack', title: 'Soundtrack is for background music (loops, ambient, etc...)'},
    {name: 'Voice', path: 'Audio/Voice', title: 'Voice is for text-to-speech and speech-to-text (AI voices, etc...)'},
]

const Datastore_entries = [
    {name: 'Signal', path: 'Datastore/Signal', title: 'Signal is for real-time data (sensors, web sockets, etc...)'},
    {name: 'Table', path: 'Datastore/Table', title: 'Table is for structured data (sql, nosql, etc...)'},
    {name: 'Files', path: 'Datastore/Files', title: 'Files is for file storage (local, cloud, etc...)'},
    {name: 'Graph', path: 'Datastore/Graph', title: 'Graph is for Graph database (nodes and edges)'},
    {name: 'Cloud', path: 'Datastore/Cloud', title: 'Cloud is for cloud storage (aws, gcp, azure, etc...)'},
    {name: 'Session', path: 'Datastore/Session', title: 'Session is for user session data (cookies, local storage, etc...)'},
    {name: 'Memory', path: 'Datastore/Memory', title: 'Memory is for in-memory data (caches, etc...)'},
]

const Scripts_entries = [
    {name: 'Javascript', path: 'Scripts/Javascript', title: 'Javascript is for main thread scripting'},
    {name: 'Workers', path: 'Scripts/Worker', title: 'Workers is for multi-threaded scripting (web workers, service workers, etc...)'},
    {name: 'WASM', path: 'Scripts/WASM', title: 'WASM is for compiled binaries (wasm, rust, c, c++, etc...)'},
    {name: 'Service', path: 'Scripts/Service', title: 'Service is for background services/external services (nodejs, python, etc...)'},
    {name: 'Network', path:'Scripts/Network', title: 'Network is for network call scripts (REST, Websocket, WebRTC, Torrent, etc...)'}
]

const Automation_entries = [
    {name: 'Blueprint', path: 'Automation/Blueprint', title: 'Blueprint is for Visual Scripting (group and link scripts and components)'},
    {name: 'Crawler', path: 'Automation/Crawlers', title: 'Crawler is for Automated web crawler scripts (SEO, site mapping, etc...)'},
    {name: 'Scrapper', path: 'Automation/Scrappers', title: 'Scrapper is for Automated web scrapper scripts (data mining)'},
    {name: 'Scheduler', path: 'Automation/Scheduler', title: 'Scheduler is for Task scheduler (cron jobs, etc...)'},
    {name: 'Agent', path: 'Automation/Agent', title: 'Agent is for AI agents (connect to AI services or use local models)'},
    {name: 'AI', path: 'Automation/AI', title: 'AI is for AI scripts (NLP, computer vision, etc...)'},
]

const showHideTypes = ['Mesh']

export {
    icons,
    projectDefault,
    COMPONENTS,
    Canvas3D_entries,
    Canvas2D_entries,
    WebView_entries,
    Audio_entries,
    Datastore_entries,
    Scripts_entries,
    Automation_entries,
    showHideTypes
}