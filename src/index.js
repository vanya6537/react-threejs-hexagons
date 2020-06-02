import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import * as THREE from 'three'
import './styles.css'
import Config from './config'
import Animation from './animation'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

class App extends Component {
  componentDidMount() {
    var BLOOM_SCENE = 1, time = 0
    //bloom
    let bloomLayer = new THREE.Layers()
    bloomLayer.set(BLOOM_SCENE)

    //scene init
    let scene = new THREE.Scene()
    //grid radius changes in dependence of window size
    const dist = Config.animation.grid.radius * Config.geometry.top.radiusVal * Math.sqrt(3) / 2
    Config.camera.posX = dist
    Config.camera.posZ = dist
    Config.camera.posY = dist * 4 / 5

    Config.controls.target.x = dist
    Config.controls.target.z = dist
    Config.controls.target.y = 0

    //camera
    let camera = new THREE.PerspectiveCamera(Config.camera.fov, window.innerWidth / window.innerHeight, Config.camera.near, Config.camera.far)
    camera.position.set(Config.camera.posX, Config.camera.posY, Config.camera.posZ)

    //renderer
    let renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setClearColor(new THREE.Color('white'))
    renderer.setPixelRatio(window.devicePixelRatio) // For retina
    renderer.toneMapping = THREE.ReinhardToneMapping
    renderer.toneMappingExposure = Config.bloom.exposure
    renderer.setSize(window.innerWidth, window.innerHeight)

    this.mount.appendChild(renderer.domElement)

    //camera control
    let controls = new OrbitControls(camera, renderer.domElement)
    controls.center = new THREE.Vector3(dist, Config.camera.posY, dist)
    controls.target.set(Config.controls.target.x, Config.controls.target.y, Config.controls.target.z)
    controls.maxPolarAngle = Math.PI * 0.5
    controls.minDistance = 1
    controls.maxDistance = 1000
    controls.update()

    // Ambient light
    let ambientLight = new THREE.AmbientLight(Config.ambientLight.color)
    ambientLight.position.set(0, 100, 0)
    ambientLight.intensity = 3
    ambientLight.visible = Config.ambientLight.enabled

    // Directional light
    let directionalLight = new THREE.DirectionalLight(Config.directionalLight.color, Config.directionalLight.intensity)
    directionalLight.position.set(Config.directionalLight.x, Config.directionalLight.y, Config.directionalLight.z)
    directionalLight.visible = Config.directionalLight.enabled
    directionalLight.target.position.set(Config.directionalLight.target.x, Config.directionalLight.target.y, Config.directionalLight.target.z)

    //add lights to scene
    scene.add(ambientLight)
    scene.add(directionalLight)
    scene.add(directionalLight.target)

    //axes helper
    let axesHelper = new THREE.AxesHelper(1000)
    scene.add(axesHelper)

    //render magic
    let renderScene = new RenderPass(scene, camera)
    let bloomComposer = new EffectComposer(renderer)
    let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), Config.bloom.bloomStrength, Config.bloom.bloomRadius, Config.bloom.bloomThreshold)
    bloomComposer.renderToScreen = false
    bloomComposer.addPass(renderScene)
    bloomComposer.addPass(bloomPass)

    //bloom material
    let shader = new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture }
      },
      vertexShader: Config.shader.vertexShader,
      fragmentShader: Config.shader.fragmentShader,
      defines: {}
    })

    let finalPass = new ShaderPass(
      shader, 'baseTexture'
    )


    let finalComposer = new EffectComposer(renderer)
    finalComposer.addPass(renderScene)
    finalComposer.addPass(finalPass)


    //Create material
    let bottom_material = new THREE.MeshBasicMaterial({
      color: Config.mesh.material.bottom.color
    })

    let top_material = new THREE.MeshPhysicalMaterial({
      color: Config.mesh.material.top.color,
      flatShading: true,
      roughness: 0.7,
      metalness: 0.3,
      side: THREE.DoubleSide
    })

    const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
    let materials = {}


    // Create and place geo in scene
    let bottom_geometry = new THREE.CylinderGeometry(Config.geometry.bottom.radiusVal, Config.geometry.top.radiusVal, Config.geometry.bottom.height, Config.geometry.bottom.radialSegments)
    let top_geometry = new THREE.CylinderGeometry(Config.geometry.top.radiusVal, Config.geometry.top.radiusVal, Config.geometry.top.height, Config.geometry.top.radialSegments)
    let top_mesh = new THREE.Mesh(top_geometry, top_material)
    let bottom_mesh = new THREE.Mesh(bottom_geometry, bottom_material)
    bottom_mesh.layers.enable(BLOOM_SCENE)

    top_mesh.position.y = Config.geometry.bottom.height - Config.geometry.top.height / 2


    let group_mesh = new THREE.Group()
    group_mesh.add(bottom_mesh)
    group_mesh.add(top_mesh)
    let animation = new Animation(scene)
    animation.createGrid(group_mesh, scene, Config.animation.grid.radius)

    let raycaster = new THREE.Raycaster()
    let mouse = new THREE.Vector2()
    window.onresize = function() {

      let width = window.innerWidth
      let height = window.innerHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)

      bloomComposer.setSize(width, height)
      finalComposer.setSize(width, height)

      render()

    }

    function onDocumentMouseClick(event) {

      event.preventDefault()

      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      console.log('ha')

      raycaster.setFromCamera(mouse, camera)
      let intersects = raycaster.intersectObjects(scene.children, true)

      // console.log(intersects);

      if (intersects.length > 0) {
        let object = intersects[0].object
        console.log(object.material.color)
        object.layers.toggle(BLOOM_SCENE)
        render()
      }
    }


    function render() {
      renderer.setClearColor(new THREE.Color('black'))
      bloomComposer.render()
      renderer.setClearColor(new THREE.Color('white'))

      finalComposer.render()

    }

    renderer.domElement.addEventListener('click', (event) => onDocumentMouseClick(event), false)

    var gui = new GUI()

    var folder = gui.addFolder('Bloom Parameters')
    folder.add(Config.bloom, 'exposure', 0.1, 2).onChange(function(value) {

      renderer.toneMappingExposure = Math.pow(value, 4.0)
      render()

    })
    folder.add(Config.bloom, 'bloomThreshold', 0.0, 1.0).onChange(function(value) {

      bloomPass.threshold = Number(value)
      render()

    })
    folder.add(Config.bloom, 'bloomStrength', 0.0, 10.0).onChange(function(value) {

      bloomPass.strength = Number(value)
      render()

    })
    folder.add(Config.bloom, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function(value) {

      bloomPass.radius = Number(value)
      render()

    })

    var LightTargetFolder = gui.addFolder('Light Target')
    var LightFolder = gui.addFolder('Light')

    LightTargetFolder.add(Config.directionalLight.target, 'x', 0, 2000).onChange(function(value) {

      directionalLight.target.position.x = Number(value)
      render()

    })
    LightTargetFolder.add(Config.directionalLight.target, 'y', 0, 2000).onChange(function(value) {

      directionalLight.target.position.y = Number(value)
      render()

    })
    LightTargetFolder.add(Config.directionalLight.target, 'z', 0, 2000).onChange(function(value) {

      directionalLight.target.position.z = Number(value)
      render()

    })
    LightFolder.add(Config.directionalLight, 'intensity', 0.0, 3.0).step(0.01).onChange(function(value) {

      directionalLight.intensity = Number(value)
      render()

    })
    LightFolder.add(Config.directionalLight, 'x', -2000, 2000, 40).onChange(function(value) {

      directionalLight.position.x = Number(value)
      render()

    })
    LightFolder.add(Config.directionalLight, 'y', -2000, 2000, 40).onChange(function(value) {

      directionalLight.position.y = Number(value)
      render()

    })
    LightFolder.add(Config.directionalLight, 'z', -2000, 2000, 40).onChange(function(value) {

      directionalLight.position.z = Number(value)
      render()

    })


    var animate = function() {
      time += 0.01
      animation.animateGrid(time)
      render()
      requestAnimationFrame(animate)

      // composer.render()
      // finalComposer.render()
    }
    animate()
  }

  render() {
    return (
      <div ref={ref => (this.mount = ref)}/>
    )
  }

}

const rootElement = document.getElementById('root')
ReactDOM.render(
  <App/>,
  rootElement
)