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
    let bloomLayer = new THREE.Layers()
    bloomLayer.set(BLOOM_SCENE)
    // let Helpers = Helpers();

    let onToggleTimeOut = 0, onToggleTimeOutConst = 500

    let scene = new THREE.Scene()
    const dist = Config.animation.grid.radius*Config.geometry.top.radiusVal*Math.sqrt(3)/2

    let camera = new THREE.PerspectiveCamera(Config.camera.fov, window.innerWidth / window.innerHeight, Config.camera.near, Config.camera.far)
    camera.position.set(dist, Config.camera.posY, dist)

    // camera.position.set(dist, Config.camera.posY, dist)
    // camera.lookAt(new THREE.Vector3(dist,-1,dist))
    // camera.rotateOnAxis(new THREE.Vector3(1,1,1),90)
    let renderer = new THREE.WebGLRenderer()//{ antialias: true })
    renderer.setClearColor(new THREE.Color('black'))
    renderer.setPixelRatio(window.devicePixelRatio) // For retina
    renderer.toneMapping = THREE.ReinhardToneMapping
    renderer.toneMappingExposure = Config.bloom.exposure

    // renderer.shadowMap.enabled = true
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setSize(window.innerWidth, window.innerHeight)


    this.mount.appendChild(renderer.domElement)

    let controls = new OrbitControls(camera, renderer.domElement)
    controls.center=new THREE.Vector3(dist, Config.camera.posY, dist)
    controls.target.set(dist*0.8,-1,dist);
    // controls
    controls.maxPolarAngle = Math.PI * 0.5
    controls.minDistance = 1
    controls.maxDistance = 1000
    controls.update()
// Ambient
    let ambientLight = new THREE.AmbientLight(Config.ambientLight.color)
    ambientLight.position.y = 30
    ambientLight.visible = Config.ambientLight.enabled

    // Point light
    let pointLight = new THREE.PointLight(Config.pointLight.color, Config.pointLight.intensity, Config.pointLight.distance)
    pointLight.position.set(Config.pointLight.x, Config.pointLight.y, Config.pointLight.z)
    pointLight.visible = Config.pointLight.enabled

    // Directional light
    let directionalLight = new THREE.DirectionalLight(Config.directionalLight.color, Config.directionalLight.intensity)
    directionalLight.position.set(Config.directionalLight.x, Config.directionalLight.y, Config.directionalLight.z)
    directionalLight.visible = Config.directionalLight.enabled

    // Shadow map
    directionalLight.castShadow = Config.shadow.enabled
    directionalLight.shadow.bias = Config.shadow.bias
    directionalLight.shadow.camera.near = Config.shadow.near
    directionalLight.shadow.camera.far = Config.shadow.far
    directionalLight.shadow.camera.left = Config.shadow.left
    directionalLight.shadow.camera.right = Config.shadow.right
    directionalLight.shadow.camera.top = Config.shadow.top
    directionalLight.shadow.camera.bottom = Config.shadow.bottom
    directionalLight.shadow.mapSize.width = Config.shadow.mapWidth
    directionalLight.shadow.mapSize.height = Config.shadow.mapHeight

    // Shadow camera helper
    let directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
    directionalLightHelper.visible = Config.shadow.helperEnabled

    // Hemisphere light
    let hemiLight = new THREE.HemisphereLight(Config.hemiLight.color, Config.hemiLight.groundColor, Config.hemiLight.intensity)
    hemiLight.position.set(Config.hemiLight.x, Config.hemiLight.y, Config.hemiLight.z)
    hemiLight.visible = Config.hemiLight.enabled

    // scene.add(ambientLight)
    // scene.add(directionalLight)
    // scene.add(directionalLightHelper)
    // scene.add(hemiLight)
    // scene.add(pointLight)

    let top_material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('rgb(192,192,192)')

    })
    let bottom_material = new THREE.MeshBasicMaterial({
      color: Config.mesh.material.bottom.color,
    })
    // set composer
    let bloomComposer = new EffectComposer(renderer)
    let renderScene = new RenderPass(scene, camera)
    let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), Config.bloom.bloomStrength, Config.bloom.bloomRadius, Config.bloom.bloomThreshold)

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
      shader, 'baseTexture',
    )

    // let physicPass = new ShaderPass(PhysicalMaterial)
    finalPass.needsSwap = true

    bloomComposer.renderToScreen = false
    bloomComposer.addPass(renderScene)
    bloomComposer.addPass(bloomPass)
    let finalComposer = new EffectComposer(renderer)
    finalComposer.addPass(renderScene)
    finalComposer.addPass(finalPass)
    // bloomLayer.set(1)


    //Create material

    // let top_material = new THREE.MeshPhysicalMaterial({
    //   color: Config.mesh.material.top.color
      // flatShading: THREE.FlatShading,
      // roughness: 1,
      // metalness: 0
      // side: THREE.DoubleSide
    // })

    const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
    let materials = {}


    // Create and place geo in scene
    let bottom_geometry = new THREE.CylinderGeometry(Config.geometry.bottom.radiusVal, Config.geometry.top.radiusVal, Config.geometry.bottom.height, Config.geometry.bottom.radialSegments)
    let top_geometry = new THREE.CylinderGeometry(Config.geometry.top.radiusVal, Config.geometry.top.radiusVal, Config.geometry.top.height, Config.geometry.top.radialSegments)

    // console.log(bottom_geometry)
    // console.log(top_geometry)

    let top_mesh = new THREE.Mesh(top_geometry, top_material)
    // top_mesh.layers.enable(1)
    let bottom_mesh = new THREE.Mesh(bottom_geometry, bottom_material)
    bottom_mesh.layers.enable(BLOOM_SCENE)

    top_mesh.position.y = Config.geometry.bottom.height - Config.geometry.top.height / 2


    let group_mesh = new THREE.Group()
    group_mesh.add(bottom_mesh)
    group_mesh.add(top_mesh)
    // group_mesh.receiveShadow = Config.shadow.enabled
    // group_mesh.scale.multiplyScalar(0.2);
    // console.log(group_mesh);

    // group_mesh.scale.multiplyScalar(Config.model.scale);
    //Create grid and animate it
    // camera.layers.disableAll()
    let animation = new Animation(scene)
    // console.log(animation);

    let raycaster = new THREE.Raycaster()

    animation.createGrid(group_mesh, scene, Config.animation.grid.radius)
    // render()
    let mouse = new THREE.Vector2()
    // console.log(scene.children);
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

      if (intersects.length > 0 && !onToggleTimeOut) {
        let object = intersects[0].object
        console.log(object.material.color)
        object.layers.toggle(BLOOM_SCENE)
        render()
      }
    }

    function darkenNonBloomed(obj) {

      if (obj.isMesh && bloomLayer.test(obj.layers) === false) {

        materials[obj.uuid] = obj.material
        obj.material = darkMaterial

      }

    }

    function restoreMaterial(obj) {

      if (materials[obj.uuid]) {

        obj.material = materials[obj.uuid]
        // console.log(obj.material.color)
        delete materials[obj.uuid]

      }

    }

    function render() {
      scene.traverse(darkenNonBloomed)
      bloomComposer.render()
      // renderer.render(scene,camera);
      scene.traverse(restoreMaterial)
      finalComposer.render()

    }

    // window.addEventListener('click', onDocumentMouseClick, false)
    renderer.domElement.addEventListener('click', (event) => onDocumentMouseClick(event), false)
    // renderer.domElement.addEventListener('mouseleave', (event) => this.onMouseLeave(event), false);
    // renderer.domElement.addEventListener('mouseover', (event) => this.onMouseOver(event), false);

    var gui = new GUI()

    // gui.add( Config.ambientLight, 'color', [ Config.ambientLight.color,Config.ambientLight.color2 ] ).onChange( function ( value ) {
    //
    //   ambientLight.color=value;
    //
    //   render();
    //
    // } );
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


    var animate = function() {
      time+=0.01
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