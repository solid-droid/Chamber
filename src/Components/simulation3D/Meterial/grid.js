import {Color3} from '@babylonjs/core';
import { GridMaterial } from "@babylonjs/materials";

export function Grid(name, scene, options = {}) {
    options = {
        majorUnitFrequency: 10,
        minorUnitVisibility: 0.25,
        gridRatio: 1,
        backFaceCulling: false,
        mainColor: new Color3(1, 1, 1),
        lineColor: new Color3(1.0, 1.0, 1.0),
        opacity: 0.2,
        ...options
    };

    let NodeMaterial = scene.getEngine().chamber.entity.getEntity(name, 'material');
    if (NodeMaterial) {
        return NodeMaterial;
    }
    NodeMaterial = new GridMaterial(`${name}`, scene);
    NodeMaterial.majorUnitFrequency = options.majorUnitFrequency; 
    NodeMaterial.minorUnitVisibility = options.minorUnitVisibility; 
    NodeMaterial.gridRatio = options.gridRatio; 
    NodeMaterial.backFaceCulling = options.backFaceCulling;
    NodeMaterial.mainColor = options.mainColor;
    NodeMaterial.lineColor = options.lineColor;
    NodeMaterial.opacity = options.opacity;
    scene.getEngine().chamber.entity.setEntity(name, 'material', NodeMaterial);
    return NodeMaterial;   
}
