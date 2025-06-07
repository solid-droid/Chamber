import {MeshBuilder} from '@babylonjs/core';

export function Ground(name, scene, options = {}) {
    options = {
        width: 10000,
        height: 10000,
        subdivisions: 2,
        ...options
    };
    let ground = scene.getEngine().chamber.entity.getEntity(name, 'mesh');
    if (ground){
        return ground;
    }
    ground = MeshBuilder.CreateGround(name,{
        width: options.width,
        height: options.height,
        subdivisions: options.subdivisions
    }, scene);
    if( options.material) {
        ground.material = options.material;
    }
    scene.getEngine().chamber.entity.setEntity(name, 'mesh', ground);
    return ground;
}