import * as THREE from 'three';

export const WAVES = [
  {
    direction: new THREE.Vector2(1.0, 0.2).normalize(),
    steepness: 0.18,
    wavelength: 28.0,
    speed: 1.0,
  },
  {
    direction: new THREE.Vector2(0.7, 1.0).normalize(),
    steepness: 0.12,
    wavelength: 18.0,
    speed: 1.6,
  },
  {
    direction: new THREE.Vector2(-1.0, 0.4).normalize(),
    steepness: 0.07,
    wavelength: 9.0,
    speed: 2.2,
  },
];

export function getWaveUniforms() {
  return {
    directions: WAVES.map((w) => w.direction.clone()),
    steepness: WAVES.map((w) => w.steepness),
    wavelength: WAVES.map((w) => w.wavelength),
    speed: WAVES.map((w) => w.speed),
  };
}

export function sampleOceanHeight(x, z, time) {
  let y = 0;

  for (const wave of WAVES) {
    const k = (2.0 * Math.PI) / wave.wavelength;
    const c = Math.sqrt(9.81 / k) * wave.speed;
    const phase = k * (wave.direction.x * x + wave.direction.y * z - c * time);
    const a = wave.steepness / k;
    y += a * Math.sin(phase);
  }

  return y;
}

export function sampleOceanDisplacement(x, z, time) {
  let dx = 0;
  let dy = 0;
  let dz = 0;

  for (const wave of WAVES) {
    const k = (2.0 * Math.PI) / wave.wavelength;
    const c = Math.sqrt(9.81 / k) * wave.speed;
    const phase = k * (wave.direction.x * x + wave.direction.y * z - c * time);
    const a = wave.steepness / k;

    dx += wave.direction.x * (a * Math.cos(phase));
    dy += a * Math.sin(phase);
    dz += wave.direction.y * (a * Math.cos(phase));
  }

  return new THREE.Vector3(dx, dy, dz);
}