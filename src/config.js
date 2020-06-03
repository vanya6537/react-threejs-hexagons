// This object contains the state of the app

export default {
  isDev: false,
  isShowingStats: true,
  isLoaded: false,
  isTweening: false,
  isRotating: true,
  isMouseMoving: false,
  isMouseOver: false,
  maxAnisotropy: 1,
  dpr: 1,

  shader: {
    uniforms: {
      time: { type: 'f', value: 1.0 },
      explosion: { type: 'f', value: 1.0 }
      // resolution: {
      //     type: 'v2', value: {x: window.innerWidth, y: window.innerHeight},
      // },
    }, vertexShader: /*GLSL*/
      `
varying vec2 vUv;
void main() {
vUv = uv;
gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
        `,
    fragmentShader:
      `
    uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
varying vec2 vUv;

vec4 getTexture( sampler2D texelToLinearTexture ) {
return mapTexelToLinear( texture2D( texelToLinearTexture , vUv ) );
}
void main() {
  gl_FragColor = ( getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( bloomTexture ) );
        gl_FragColor.a =  getTexture( baseTexture ).a; // THIS did it

}
`
  }, bloom: {
    bloomStrength: 0.6, bloomRadius: 0.1, bloomThreshold: 1, exposure: 1.2

  },
  geometry: {
    top: { radiusVal: 10, height: 2, radialSegments: 6 },
    bottom: { radiusVal: 10, height: 4, radialSegments: 6 }
  },
  animation: {
    grid: {
      radius: 22
    }
  },
  mesh: {
    enableHelper: false,
    wireframe: false,
    translucent: false,
    material: {
      top: {
        color: 0xffffff,
        emissive: 0xffffff
      },
      bottom: {
        color: 0x00b2ff,
        emissive: 0xffffff
      }
    }
  },
  fog: {
    color: 0xffffff,
    near: 0.0008
  },
  camera: {
    fov: 80,
    near: 2,
    far: 800,
    aspect: 1,
    posX: 10,
    posY: 20,
    posZ: 4
  },
  controls: {
    autoRotate: false,
    autoRotateSpeed: -0.5,
    rotateSpeed: 0.5,
    zoomSpeed: 0.8,
    minDistance: 1,
    maxDistance: 600,
    minPolarAngle: Math.PI / 5,
    maxPolarAngle: Math.PI / 2,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    enableDamping: true,
    dampingFactor: 0.5,
    enableZoom: true,
    target: {
      x: 0,
      y: 0,
      z: 40
    }
  },
  ambientLight: {
    enabled: true,
    color: 0x141414,
    color2: 0x404040
  },
  directionalLight: {
    enabled: true,
    color: 0xffffff,
    intensity: 0.5,
    x: 0,
    y: 60,
    z: 0,
    target: {
      x: 0,
      y: 0,
      z: 0
    }
  },
  shadow: {
    enabled: true,
    helperEnabled: true,
    bias: 0,
    mapWidth: 2048,
    mapHeight: 2048,
    near: 250,
    far: 400,
    top: 100,
    right: 100,
    bottom: -100,
    left: -100
  },
  pointLight: {
    enabled: true,
    color: 0xffffff,
    intensity: 0.3,
    distance: 115,
    x: 0,
    y: 50,
    z: 0
  },
  hemiLight: {
    enabled: true,
    color: 0xc8c8c8,
    groundColor: 0xffffff,
    intensity: 0.55,
    x: 0,
    y: 0,
    z: 0
  }
}
