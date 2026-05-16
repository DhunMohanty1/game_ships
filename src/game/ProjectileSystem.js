import * as THREE from 'three';

export class ProjectileSystem {
  constructor(scene, ocean) {
    this.scene = scene;
    this.ocean = ocean;
    
    this.projectiles = [];
    this.particles = [];
    this.debris = []; // Array for destruction debris
    
    this.gravity = 9.81 * 1.5;
    this.speed = 60.0; // Faster, more realistic

    this.sphereGeo = new THREE.SphereGeometry(0.35, 12, 12);
    this.ballMat = new THREE.MeshStandardMaterial({ 
      color: 0xffaa00, 
      emissive: 0xff4400,
      emissiveIntensity: 2.0,
      roughness: 0.2 
    });
    
    this.splashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    this.debrisMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 1.0 }); // Wood debris
  }

  spawnProjectile(position, direction, ownerId) {
    const mesh = new THREE.Mesh(this.sphereGeo, this.ballMat);
    mesh.position.copy(position);
    
    // Add point light to projectile
    const light = new THREE.PointLight(0xff6600, 2.0, 15.0);
    mesh.add(light);
    
    this.scene.add(mesh);

    const velocity = direction.clone().normalize().multiplyScalar(this.speed);

    this.projectiles.push({
      mesh,
      velocity,
      ownerId,
      life: 0,
      maxLife: 5.0,
      lastPos: position.clone()
    });
  }

  spawnSmoke(position) {
    const count = 3;
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.2 + Math.random(), 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.5 })
      );
      mesh.position.copy(position);
      this.scene.add(mesh);
      
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3((Math.random()-0.5)*4, Math.random()*2+1, (Math.random()-0.5)*4),
        scale: 1,
        life: 0,
        maxLife: 1.5,
        type: 'smoke'
      });
    }
  }

  spawnSplash(position) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
        this.splashMat
      );
      mesh.position.copy(position);
      this.scene.add(mesh);
      
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          Math.random() * 12 + 4,
          (Math.random() - 0.5) * 8
        ),
        scale: 1,
        life: 0,
        maxLife: 1.0,
        type: 'splash'
      });
    }
  }

  spawnExplosion(position) {
    const light = new THREE.PointLight(0xff5500, 10.0, 20.0);
    light.position.copy(position);
    this.scene.add(light);
    
    this.particles.push({
      mesh: light,
      velocity: new THREE.Vector3(0,0,0),
      scale: 1,
      life: 0,
      maxLife: 0.5,
      type: 'explosion_light'
    });
    
    this.spawnSmoke(position);
    this.spawnSmoke(position); // extra smoke
  }

  spawnDebris(position) {
    const count = 8;
    for(let i=0; i<count; i++) {
       const mesh = new THREE.Mesh(
         new THREE.BoxGeometry(0.5 + Math.random(), 0.2, 0.5 + Math.random()),
         this.debrisMat
       );
       mesh.position.copy(position);
       this.scene.add(mesh);
       
       this.debris.push({
         mesh,
         velocity: new THREE.Vector3(
           (Math.random() - 0.5) * 15,
           Math.random() * 10 + 5,
           (Math.random() - 0.5) * 15
         ),
         rotSpeed: new THREE.Vector3(Math.random(), Math.random(), Math.random()),
         life: 0,
         maxLife: 4.0
       });
    }
  }

  update(delta, time) {
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.lastPos.copy(p.mesh.position);
      
      // Gravity
      p.velocity.y -= this.gravity * delta;
      
      // Move
      p.mesh.position.addScaledVector(p.velocity, delta);
      
      p.life += delta;
      
      // Check ocean collision
      if (p.mesh.position.y < 0) {
        this.spawnSplash(p.mesh.position);
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.life > p.maxLife) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      
      if (p.type === 'splash') {
        p.velocity.y -= this.gravity * delta;
        p.mesh.position.addScaledVector(p.velocity, delta);
      } else if (p.type === 'smoke') {
        p.mesh.position.addScaledVector(p.velocity, delta);
      }
      
      const t = p.life / p.maxLife;
      
      if (p.type === 'smoke') {
        p.scale = 1 + t * 3;
        p.mesh.material.opacity = 0.5 * (1 - t);
        p.mesh.scale.set(p.scale, p.scale, p.scale);
      } else if (p.type === 'splash') {
        p.scale = 1 - t;
        p.mesh.scale.set(p.scale, p.scale, p.scale);
      } else if (p.type === 'explosion_light') {
        p.mesh.intensity = 10.0 * (1 - t);
      }

      if (p.life > p.maxLife) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
    
    // Update debris
    for (let i = this.debris.length - 1; i >= 0; i--) {
       const d = this.debris[i];
       d.life += delta;
       d.velocity.y -= this.gravity * delta;
       d.mesh.position.addScaledVector(d.velocity, delta);
       d.mesh.rotation.x += d.rotSpeed.x * delta;
       d.mesh.rotation.y += d.rotSpeed.y * delta;
       d.mesh.rotation.z += d.rotSpeed.z * delta;
       
       // Stop at water
       if (d.mesh.position.y <= 0) {
          d.mesh.position.y = 0;
          d.velocity.set(0,0,0);
          d.rotSpeed.set(0,0,0);
       }
       
       if (d.life > d.maxLife) {
          // sink
          d.mesh.position.y -= delta * 0.5;
          if (d.life > d.maxLife + 2.0) {
             this.scene.remove(d.mesh);
             this.debris.splice(i, 1);
          }
       }
    }
  }
}
