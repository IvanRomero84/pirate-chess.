import {
  Scene,
  AssetContainer,
  AbstractMesh,
  AnimationGroup,
  SceneLoader
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

export interface LoadedModel {
  mesh: AbstractMesh;
  animationGroups: AnimationGroup[];
}

// URLs for each piece type and color (One Piece Theme!)
const PIECE_MODELS: Record<string, string> = {
  // Straw Hat Pirates (White side)
  'p_w': '/models/one_piece_general_franky.glb',           // Pawn: General Franky
  'r_w': '/models/one_piece_jimbei.glb',                   // Rook: Jinbei
  'n_w': '/models/one_piece_sanji.glb',                    // Knight: Sanji
  'b_w': '/models/zoro_-_one_piece.glb',                   // Bishop: Roronoa Zoro
  'q_w': '/models/one_piece_nami.glb',                     // Queen: Nami
  'k_w': '/models/monkey_d_luffy.glb',                     // King: Monkey D. Luffy

  // Marines / Navy (Black side)
  'p_b': '/models/one_piece_bounty_rush_marine__mullet.glb', // Pawn: Marine Soldier
  'r_b': '/models/one_piece_fujitora.glb',                  // Rook: Fujitora
  'n_b': '/models/one_piece_borsalino.glb',                  // Knight: Borsalino (Kizaru)
  'b_b': '/models/one_piece_kuzan.glb',                     // Bishop: Kuzan (Aokiji)
  'q_b': '/models/one_piece_sakazuki.glb',                  // Queen: Sakazuki (Akainu)
  'k_b': '/models/one_piece_sengoku.glb',                   // King: Sengoku
};

export class AssetManager {
  private scene: Scene;
  private piecesLoaded = false;

  // Generic containers for each One Piece character model
  private containers = new Map<string, AssetContainer>();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Loads all 12 individual One Piece GLB character models in parallel.
   */
  public async loadAllPieces(): Promise<void> {
    if (this.piecesLoaded) return;

    console.log('[AssetManager] Starting parallel loading of all One Piece character GLB models...');

    const promises = Object.entries(PIECE_MODELS).map(async ([key, url]) => {
      try {
        const container = await SceneLoader.LoadAssetContainerAsync('', url, this.scene);
        // Stop any autoplaying animations in the container
        container.animationGroups.forEach(ag => ag.stop());
        this.containers.set(key, container);
      } catch (e) {
        console.error(`[AssetManager] Failed to load character model for '${key}' from ${url}:`, e);
      }
    });

    await Promise.all(promises);
    this.piecesLoaded = true;
    console.log('[AssetManager] All One Piece character models loaded successfully!');
  }

  /**
   * Instantiate/Clone the model container for the given piece type and color.
   */
  public clonePiece(type: string, color: 'w' | 'b'): AbstractMesh | null {
    const key = `${type}_${color}`;
    const container = this.containers.get(key);
    if (!container) {
      console.warn(`[AssetManager] No container found for character '${key}'`);
      return null;
    }

    const suffix = Math.random().toString(36).slice(2, 7);
    // Use instantiateModelsToScene to create a fully textured & skinned clone with hierarchy
    const entries = container.instantiateModelsToScene(name => `${name}_${key}_${suffix}`, true);

    // The root node of the instantiated GLB is entries.rootNodes[0]
    const root = entries.rootNodes[0] as AbstractMesh;
    if (!root) {
      console.warn(`[AssetManager] Failed to instantiate root node for '${key}'`);
      return null;
    }

    root.setEnabled(true);
    root.isVisible = true;

    // Attach the animation groups on the root mesh metadata for playability
    root.metadata = {
      animationGroups: entries.animationGroups
    };

    return root;
  }

  public arePiecesLoaded(): boolean {
    return this.piecesLoaded;
  }
}
