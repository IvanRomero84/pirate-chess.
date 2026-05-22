import { 
  Scene, 
  ParticleSystem, 
  Texture, 
  Color4, 
  Vector3, 
  GPUParticleSystem,
  Mesh
} from '@babylonjs/core';

export class EffectManager {
  private scene: Scene;
  private explosionPool: ParticleSystem[] = [];
  private readonly POOL_SIZE = 5;

  constructor(scene: Scene) {
    this.scene = scene;
    this.initPool();
  }

  private initPool() {
    for (let i = 0; i < this.POOL_SIZE; i++) {
      const ps = this.createSystem('explosion_' + i);
      ps.stop();
      this.explosionPool.push(ps);
    }
  }

  private createSystem(name: string): ParticleSystem {
    const ps = new ParticleSystem(name, 500, this.scene);
    ps.particleTexture = new Texture('https://assets.babylonjs.com/textures/flare.png', this.scene);
    ps.minEmitBox = new Vector3(-0.2, 0, -0.2);
    ps.maxEmitBox = new Vector3(0.2, 0.5, 0.2);
    ps.colorDead = new Color4(0, 0, 0, 0);
    ps.minSize = 0.1;
    ps.maxSize = 0.3;
    ps.minLifeTime = 0.3;
    ps.maxLifeTime = 0.8;
    ps.emitRate = 1000;
    ps.manualEmitCount = 300;
    ps.gravity = new Vector3(0, -9.81, 0);
    ps.minEmitPower = 1;
    ps.maxEmitPower = 5;
    ps.updateSpeed = 0.005;
    return ps;
  }

  public createMagicExplosion(position: Vector3, color: Color4 = new Color4(0.4, 0.6, 1, 1)) {
    // Find an idle system in the pool
    const particles = this.explosionPool.find(ps => !ps.isStarted()) || this.explosionPool[0];
    
    particles.emitter = position;
    particles.color1 = color;
    particles.color2 = new Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0);
    
    particles.start();
  }

  public createShadowEffect(position: Vector3) {
    const color = new Color4(0.1, 0, 0.1, 1);
    this.createMagicExplosion(position, color);
  }
}
