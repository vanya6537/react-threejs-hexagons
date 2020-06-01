import Config from './config'

export default class Animation {
  constructor(scene) {
    // Scene that the clip will be applied to
    this.scene = scene
    this.staggerArray = []
    this.timer = 0
    // Initialize animation mixer
  }

  createGrid(mesh, scene, radius) {
    let radiusVal = Config.geometry.top.radiusVal
    let distance = radiusVal * Math.sqrt(3)
    for (let i = 0; i < radius; i++) {
      for (let j = 0; j < radius; j++) {
        let add_distance_j = j % 2 ? distance / 2 : 0
        let new_mesh = mesh.clone()
        new_mesh.position.x = distance * i + add_distance_j
        new_mesh.position.z = radiusVal * j + radiusVal / 2 * j
        new_mesh.position.y = 20 - (new_mesh.position.x + new_mesh.position.z) / 3
        this.staggerArray.push(new_mesh)
        scene.add(new_mesh)
      }

    }
  }

  animateGrid(time) {
    // console.log(this.staggerArray);
    // this.timer += delta;
    this.staggerArray.forEach((value, index) => {
      let multiplier = Math.sin(time) * Math.cos(index + time)

      value.position.y = Config.geometry.bottom.height * 3 / 5 * multiplier


    })
  }
};
// export default class Animation {
//   constructor(obj, clip) {
//     // Scene that the clip will be applied to
//     this.obj = obj;
//
//     // Initialize animation mixer
//     this.mixer = new THREE.AnimationMixer(this.obj);
//
//     // Simple animation player
//     this.playClip(clip);
//   }
//
//   playClip(clip) {
//     this.action = this.mixer.clipAction(clip);
//
//     this.action.play();
//   }
//
//   // Call update in loop
//   update(delta) {
//     if(this.mixer) {
//       this.mixer.update(delta);
//     }
//   }
// }
