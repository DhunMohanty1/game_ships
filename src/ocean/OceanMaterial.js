import * as THREE from 'three';
import { getWaveUniforms } from './OceanWaves.js';

export function createOceanMaterial() {
  const waveUniforms = getWaveUniforms();

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },

      uWaveDirections: { value: waveUniforms.directions },
      uWaveSteepness: { value: waveUniforms.steepness },
      uWaveWavelength: { value: waveUniforms.wavelength },
      uWaveSpeed: { value: waveUniforms.speed },

      uDeepColor: { value: new THREE.Color('#0066ff') }, // Richer deep blue
      uShallowColor: { value: new THREE.Color('#00ccff') }, // Vibrant turquoise
      uFoamColor: { value: new THREE.Color('#ffffff') }, // Pure white foam

      uFogColor: { value: new THREE.Color('#44aaff') }, // Warmer fog matching new lighting
      uFogNear: { value: 40.0 },
      uFogFar: { value: 150.0 },

      uLightDirection: {
        value: new THREE.Vector3(-0.35, 0.85, 0.15).normalize(),
      },
    },

    vertexShader: `
      precision highp float;

      uniform float uTime;
      uniform vec2 uWaveDirections[3];
      uniform float uWaveSteepness[3];
      uniform float uWaveWavelength[3];
      uniform float uWaveSpeed[3];

      varying float vWaveHeight;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      const float PI = 3.14159265359;

      void applyWave(
        int i,
        vec3 p,
        inout vec3 displaced,
        inout vec3 dpdx,
        inout vec3 dpdz
      ) {
        vec2 dir = normalize(uWaveDirections[i]);
        float steepness = uWaveSteepness[i];
        float wavelength = uWaveWavelength[i];
        float speed = uWaveSpeed[i];

        float k = (2.0 * PI) / wavelength;
        float c = sqrt(9.81 / k) * speed;
        float phase = k * (dot(dir, p.xz) - c * uTime);
        float a = steepness / k;

        float s = sin(phase);
        float co = cos(phase);

        displaced.x += dir.x * (a * co);
        displaced.y += a * s;
        displaced.z += dir.y * (a * co);

        dpdx += vec3(
          -steepness * dir.x * dir.x * s,
           steepness * dir.x * co,
          -steepness * dir.x * dir.y * s
        );

        dpdz += vec3(
          -steepness * dir.x * dir.y * s,
           steepness * dir.y * co,
          -steepness * dir.y * dir.y * s
        );
      }

      void main() {
        vec3 p = position;
        vec3 displaced = p;

        vec3 dpdx = vec3(1.0, 0.0, 0.0);
        vec3 dpdz = vec3(0.0, 0.0, 1.0);

        applyWave(0, p, displaced, dpdx, dpdz);
        applyWave(1, p, displaced, dpdx, dpdz);
        applyWave(2, p, displaced, dpdx, dpdz);

        vWaveHeight = displaced.y;
        vNormal = normalize(cross(dpdz, dpdx));

        vec4 world = modelMatrix * vec4(displaced, 1.0);
        vWorldPosition = world.xyz;

        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,

    fragmentShader: `
      precision highp float;

      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uFoamColor;
      uniform vec3 uFogColor;
      uniform vec3 uLightDirection;
      uniform float uFogNear;
      uniform float uFogFar;

      varying float vWaveHeight;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      // Simple procedural wake noise based on ship origin (0,0 for now, could pass via uniforms)
      // We skip actual wake logic in shader to keep it simple, but we boost crest foam.

      void main() {
        vec3 n = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 lightDir = normalize(uLightDirection);

        float diffuse = max(dot(n, lightDir), 0.0);
        diffuse = 0.4 + diffuse * 0.6; // Slightly brighter ambient

        // Adjusted height mix for better gradient
        float heightMix = smoothstep(-0.5, 1.2, vWaveHeight);
        vec3 waterColor = mix(uDeepColor, uShallowColor, heightMix);

        // Stronger fresnel for that stylized "glassy" look
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 2.5);
        
        // Sharper, stronger specular
        float spec = pow(max(dot(reflect(-lightDir, n), viewDir), 0.0), 80.0) * 1.5;

        // Stronger foam on crests
        float foam = smoothstep(0.35, 0.85, vWaveHeight);
        foam = pow(foam, 1.5); // make foam appear quicker
        
        // Add fake foam noise to break it up
        float noise = fract(sin(dot(vWorldPosition.xz ,vec2(12.9898,78.233))) * 43758.5453);
        foam *= (0.6 + 0.4 * noise);
        
        foam += fresnel * 0.15; // add a bit of fresnel to foam to highlight edges
        foam = clamp(foam, 0.0, 1.0);

        vec3 color = waterColor * diffuse;
        color += fresnel * 0.25 * uShallowColor; // tint fresnel with shallow color
        color += spec * 0.2;

        color = mix(color, uFoamColor, foam);

        // Warm fog
        float fogAmount = smoothstep(
          uFogNear,
          uFogFar,
          distance(cameraPosition, vWorldPosition)
        );
        color = mix(color, uFogColor, fogAmount);

        gl_FragColor = vec4(color, 1.0);
      }
    `,

    side: THREE.FrontSide,
    depthWrite: true,
    depthTest: true,
  });
}