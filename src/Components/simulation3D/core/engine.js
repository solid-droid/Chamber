import {WebGPUEngine} from '@babylonjs/core';
import Entity from './controller.js';
export async function createEngine(canvasId, webgpu = true) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        throw new Error(`Canvas with id ${canvasId} not found`);
    }
    const engine = new WebGPUEngine(canvas);
    await engine.initAsync();

    let entity = new Entity();

    engine.chamber = {
        entity
    };
    return engine;
}