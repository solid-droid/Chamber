
import * as Material from './Meterial/material';
import * as Mesh from './Mesh/mesh';
import * as Light from './Light/light';
import * as Camera from './Camera/camera';
import * as Scene from './Scene/scene';
import * as Events from './Events/events';

import {Vector3} from '@babylonjs/core';

import {createEngine} from './core/engine';


export async function simulation3D(id, options = {}) {
    let engine = await createEngine(id, true);
    if(!engine) {
        console.error('Failed to create WebGPU engine');
        return;
    }
    //scene
    let scene = Scene.basic('scene1', engine);

    //camera
    let camera = Camera.freeCamera('cam1', scene)
    camera.position = new Vector3(0, 10, 10);
    camera.setTarget(Vector3.Zero());

    Light.GlobalLight('light', scene);
    Mesh.Ground('ground', scene, {material: Material.Grid('grid', scene)});


    attachEvents(scene, options);

    return {engine, scene};
}


function attachEvents(scene, options) {
    const engine = scene.getEngine();
    Events.onClick(scene, pickResult => {
        options?.onClick(pickResult);
    });

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener('resize', () => {
        engine.resize();
    });
}