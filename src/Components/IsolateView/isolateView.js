import { createEngine } from "../Simulation3D/core/engine";
import * as Light from '../Simulation3D/Light/light';
import * as Camera from '../Simulation3D/Camera/camera';
import * as Scene from '../Simulation3D/Scene/scene';
import {Vector3, Color4, SceneSerializer, SceneLoader} from '@babylonjs/core';
import { debounce } from "../../utils/utils";

export async function isolateView(id) {
    let engine = await createEngine(id, true);
    if(!engine) {
        console.error('Failed to create WebGPU engine');
        return;
    }
    //scene
    let scene = Scene.basic('isolateView', engine);
    scene.clearColor = new Color4(0, 0, 0, 0);

    //camera
    let camera = Camera.freeCamera('isolateViewCam', scene);
    camera.PanningSensibility = 0;

    camera.setTarget(Vector3.Zero());
    Light.GlobalLight('isolateViewLight', scene);

    attachEvents(scene, id);
    return {engine, scene};
}

export function isolateViewMesh(mesh, scene){
    disposeEntities(scene);
     let cameraDistance = getZoomDistance(mesh);
    scene.activeCamera.position = new Vector3(0, cameraDistance, cameraDistance);
    scene.activeCamera.setTarget(Vector3.Zero());

    const serializedMesh = SceneSerializer.SerializeMesh(mesh);
    const serializedString = JSON.stringify(serializedMesh);
    const blob = new Blob([serializedString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    SceneLoader.LoadAssetContainer(
        "",           // Root URL (empty for Blob)
        url,          // "Filename" (Blob URL in this case)
        scene,        // Scene in second engine
        (container) => {
            //on success
            container.addAllToScene();
            scene.meshes[0].position = new Vector3(0, 0, 0);
        },
        null,
        (scene, msg, err) => {
            console.error("Error loading mesh:", msg, err);
        },
        ".babylon"    // Must specify file extension
    );

}

function disposeEntities(scene){
    scene.meshes.slice().forEach(mesh => mesh.dispose());
    scene.materials.slice().forEach(mat => mat.dispose());
    scene.textures.slice().forEach(tex => tex.dispose());
    scene.particleSystems.slice().forEach(ps => ps.dispose());
}

function getZoomDistance(obj){
    let boundingBox = obj.getBoundingInfo();
    let minimum = boundingBox.minimum;
    let maximum = boundingBox.maximum;
    let maxDimension = Math.max(maximum.x - minimum.x, maximum.y - minimum.y, maximum.z - minimum.z);
    return maxDimension * 2;
}

function attachEvents(scene, id) {
    const engine = scene.getEngine();

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener('resize', () => engine.resize());

    const resizeDebounce = debounce(()=> engine.resize() , 100);
    new ResizeObserver(resizeDebounce).observe($(engine._context.canvas).parent()[0])

}