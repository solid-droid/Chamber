[Go back to Canvas3D](../Canvas3D.md)  
These are attached directly to a Scene instance.

## Camera

### Options:
```
type: 'free' (default) or 'arc' (ArcRotateCamera)

position: [x, y, z] array (default [0, 5, -10])

target: [x, y, z] array (default [0, 0, 0])

attachControl: boolean (default true) - Attaches mouse/touch controls.
```
```javascript
myScene.add.camera("playerCam", { 
    type: "arc", 
    position: [0, 5, -10], 
    target: [0, 1, 0] 
});
```

## Light

### Options:
```
type: 'hemispheric' (default), 'directional', or 'point'

intensity: Float (default 1.0)

direction: [x, y, z] array (Acts as position for point lights, direction for others. Default [0, 1, 0])
```
```javascript
myScene.add.light("sun", { 
    type: "hemispheric", 
    intensity: 0.8 
});
```


## Mesh

### Options:

```
type: 'box' (default), 'sphere', or 'ground'

size: Float (default 1) - Note: Ground width/height is size * 10.

position: [x, y, z] array (default [0, 0, 0])
```
```javascript
// Individual additions (since .add.mesh returns the Mesh, not the Scene)
myScene.add.mesh("ground", { type: "ground", size: 5 });
myScene.add.mesh("player", { type: "box", size: 2, position: [0, 1, 0] });
myScene.add.mesh("companion", { type: "sphere", size: 1, position: [3, 0.5, 0] });
```