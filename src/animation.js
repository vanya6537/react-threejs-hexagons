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
    const timeMultiplier = 1 / 4
    // time*=timeMultiplier
    let row = 0, col = 0
    const center_index = Config.animation.grid.radius / 2

    this.staggerArray.forEach((value, index) => {
      row += 1
      if (row === Config.animation.grid.radius) {
        row = 0
        col += 1
      }
      let dist = Config.animation.grid.radius - Math.sqrt(Math.pow(center_index - row, 2) + Math.pow(center_index - col, 2))

      // let dist = center_index*2-r
      let multiplier = Math.abs(Math.sin(time * 2) * Math.cos(Math.sqrt(time) * dist / 5 + 1))

      // value.position.y = Math.min(Config.geometry.bottom.height, Config.geometry.bottom.height * multiplier)
      value.position.y = Config.geometry.bottom.height * multiplier

    })
  }
};