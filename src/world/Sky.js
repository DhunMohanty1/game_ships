import * as THREE from 'three';

export function createSky() {
  const uniforms = {
    uTopColor: { value: new THREE.Color('#8fd7ff') },
    uHorizonColor: { value: new THREE.Color('#e8fbff') },
    uSunColor: { value: new THREE.Color('#fff3c4') },
    uSunDirection: {
      value: new THREE.Vector3(-0.2, 0.65, 0.75).normalize(),
    },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec3 vWorldPosition;

      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform vec3 uTopColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uSunColor;
      uniform vec3 uSunDirection;

      varying vec3 vWorldPosition;

      void main() {
        vec3 dir = normalize(vWorldPosition);
        float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

        vec3 sky = mix(uHorizonColor, uTopColor, pow(h, 0.7));

        float sunDot = max(dot(dir, normalize(uSunDirection)), 0.0);
        float sunGlow = pow(sunDot, 55.0);
        float sunCore = pow(sunDot, 900.0);

        sky += uSunColor * (sunGlow * 0.35 + sunCore * 1.8);

        gl_FragColor = vec4(sky, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), material);
  mesh.scale.set(-1, 1, 1);
  mesh.frustumCulled = false;

  return { mesh, uniforms };
}