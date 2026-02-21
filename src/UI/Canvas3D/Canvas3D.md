## Canvas3D Proxy API Reference
Canvas3D uses a powerful Proxy-based architecture that allows you to manage Babylon.js resources using natural, chainable "verbs". Every entity created is automatically synced with a central Store and cleanly disposed of when removed.
  
## The Core Verbs

Every plugin (Canvas, Scene, Camera, Light, Mesh) inherits from Core and supports the following proxy verbs. They can be used to chain to a child plugin, or invoked directly as a function on the instance itself.

```
.add.<plugin>(name, options) - Creates a new instance.

.update.<plugin>(name, options) - Updates an existing child instance.

.get.<plugin>(name) - Retrieves a child instance from memory.

.remove.<plugin>(name) - Disposes the Babylon object and removes it from the Store.

.<plugin>(name, options) - Smart Mode: Acts as add if it doesn't exist, update if options are passed, or get if no options are passed.
```
Direct Instance Verbs:
If you already hold a reference to an instance, you can use the verbs directly as methods:
```
.update(options) - Updates the current instance.

.remove() - Disposes the current instance.
```
## Component Docs
>[Initialize BabylonJS](./Docs/Initialization.md)  
>[Render Pipelines](./Docs/Pipeline.md) 

>[Scene](./Docs/Scene.md)  
>[Camera](./Docs/Camera.md)  
>[Light](./Docs/Light.md)  

>[Mesh](./Docs/Mesh.md)  
>[Custom Mesh](./Docs/CustomMesh.md) 

>[Material](./Docs/ateria.md)  
>[Shader Material](./Docs/ShaderMaterial.md) 

>[Input Controls](./Docs/Input.md)

>[Animation](./Docs/Animation.md)  
>[Bones and IK](./Docs/BonesAndIK.md)  
>[Physics - Havok](./Docs/Physics.md) 

## Game Templates

>[Game Shooter 3D (First & Third Person POV)](./Docs/Initialization.md)  
>[Game Isometric/Top Down](./Docs/Pipeline.md)  
>[Game Platformer](./Docs/Initialization.md)   

## Plugins
>[Terain](./Docs/Initialization.md)   
>[Grass](./Docs/Initialization.md)  
>[Tree](./Docs/Initialization.md)  
>[Water](./Docs/Initialization.md)  
>[Wind](./Docs/Initialization.md)  

>[Fabric](./Docs/Initialization.md)  

## Productivity Apps Template
>[Designer - Design 2D/3D](./Docs/Initialization.md)   
>[Digital Twin](./Docs/Initialization.md)  
>[Dashboard - Widgets](./Docs/Initialization.md)  
>[Blueprint - Node Editor](./Docs/Pipeline.md)  