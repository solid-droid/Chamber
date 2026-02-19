export class BoneSystem {
  constructor(scene, registry) {
    this.scene = scene;
    this.registry = registry;
  }

  create(name, opts) {
    // Basic Skeleton creation
    // Note: Creating bones manually is complex. 
    // Usually skeletons are loaded with models. 
    // This helper assumes a programmatic approach.
    
    const skeleton = new BABYLON.Skeleton(name, name + "_id", this.scene);
    
    if (opts.bones && Array.isArray(opts.bones)) {
        const boneMap = new Map();
        opts.bones.forEach(bData => {
            const parent = bData.parent ? boneMap.get(bData.parent) : null;
            
            // Matrix calculation or simple position
            // For simplicity, we use simple positioning relative to parent
            // A robust system would require matrix inputs
            
            const matrix = BABYLON.Matrix.Identity();
            if (bData.position) {
                matrix.setTranslationFromFloats(bData.position.x, bData.position.y, bData.position.z);
            }
            
            const bone = new BABYLON.Bone(bData.name, skeleton, parent, matrix);
            boneMap.set(bData.name, bone);
        });
    }

    return skeleton;
  }

  createIKController(name, opts) {
    // opts: { mesh: 'meshName', bone: 'boneName', target: 'targetMeshName', poleTarget: 'poleName' }
    
    const mesh = this.registry.get(opts.mesh);
    if (!mesh || !mesh.skeleton) {
        console.warn(`BoneSystem: Mesh ${opts.mesh} not found or has no skeleton.`);
        return null;
    }

    const bone = mesh.skeleton.bones.find(b => b.name === opts.bone);
    if (!bone) {
        console.warn(`BoneSystem: Bone ${opts.bone} not found.`);
        return null;
    }

    const target = this.registry.get(opts.target);
    const poleTarget = opts.poleTarget ? this.registry.get(opts.poleTarget) : null;

    // Note: Babylon's IK system varies (BoneIKController is deprecated in favor of WebXR or custom solutions usually, 
    // but typically we use BoneIKController for simple setups)
    
    // We assume the user wants a simple LookAt or Position lock
    // For a robust chain, one would use BABYLON.BoneIKController
    
    const ikCtrl = new BABYLON.BoneIKController(mesh, bone, {
        targetMesh: target,
        poleTargetMesh: poleTarget,
        poleAngle: opts.poleAngle || 0
    });
    
    // Store extra data if needed
    ikCtrl.name = name;
    
    return ikCtrl;
  }

  update(skeleton, opts) {
      if (opts.returnToRest) skeleton.returnToRest();
  }
  
  updateIKController(ik, opts) {
      if (opts.update) ik.update();
      if (opts.poleAngle !== undefined) ik.poleAngle = opts.poleAngle;
  }
}