import { Scene, Sound } from '@babylonjs/core';

export class SoundManager {
  private scene: Scene;
  private sounds: Map<string, Sound> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
    this.loadSounds();
  }

  private loadSounds() {
    // Background Music (Ambient Fantasy)
    const ambientMusic = new Sound(
      'ambientMusic',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
      this.scene,
      null,
      { loop: true, autoplay: true, volume: 0.3 }
    );
    this.sounds.set('ambient', ambientMusic);

    // SFX
    this.sounds.set('move', new Sound('move', 'https://actions.google.com/sounds/v1/foley/wood_block_hit.ogg', this.scene));
    this.sounds.set('capture', new Sound('capture', 'https://actions.google.com/sounds/v1/foley/sword_clash.ogg', this.scene));
    this.sounds.set('click', new Sound('click', 'https://actions.google.com/sounds/v1/foley/button_click.ogg', this.scene));
  }

  public playSound(name: string) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.play();
    }
  }

  public stopAll() {
    this.sounds.forEach(s => s.stop());
  }

  public setVolume(name: string, volume: number) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.setVolume(volume);
    }
  }
}
