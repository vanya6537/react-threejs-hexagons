
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
            time: {type: 'f', value: 1.0},
            explosion: {type: 'f', value: 1.0},
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
        bloomStrength: 4, bloomRadius: 0, bloomThreshold: 0, exposure: 0.7,

    },
    geometry: {
        top: {radiusVal: 15, height: 4, radialSegments: 6},
        bottom: {radiusVal: 15, height: 8, radialSegments: 6},
    },
    animation: {
        grid: {
            radius: 10
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
        posX: 40,
        posY: 50,
        posZ: 40
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
            z: 0
        }
    },
    ambientLight: {
        enabled: true,
        color: 0x141414,
        color2:0x404040
    },
    directionalLight: {
        enabled: true,
        color: 0xffffff,
        intensity: 0.4,
        x: -75,
        y: 280,
        z: 150
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
        intensity: 0.34,
        distance: 115,
        x: 0,
        y: 0,
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
};
