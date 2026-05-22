import {
  Scene,
  MeshBuilder,
  PBRMaterial,
  Color3,
  Vector3,
  Mesh,
  AbstractMesh,
  Animation,
  AnimationGroup,
  QuadraticEase,
  EasingFunction
} from '@babylonjs/core';
import type { PieceType, PieceColor } from '../core/types';
import { AssetManager } from './AssetManager';

// Target heights in board units per piece type
const PIECE_TARGET_HEIGHTS: Record<string, number> = {
  p: 0.52,
  r: 0.65,
  n: 0.55,
  b: 0.62,
  q: 0.70,
  k: 0.78,
};

export class PieceRenderer {
  private scene: Scene;
  private assets: AssetManager;
  private pieces: Map<string, AbstractMesh> = new Map();
  private piecesBySquare: Map<string, AbstractMesh> = new Map();
  private selectionRing: Mesh | null = null;

  // Fallback shared materials (only used when 3D models unavailable)
  private matFallback_w: PBRMaterial | null = null;
  private matFallback_b: PBRMaterial | null = null;

  constructor(scene: Scene, assets: AssetManager) {
    this.scene = scene;
    this.assets = assets;
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------

  public createPiece(type: PieceType, color: PieceColor, id: string, row: number, col: number): AbstractMesh {
    const mesh = this.buildMesh(type, color, id);
    mesh.name = id;

    const pos = this.getBoardPosition(row, col);
    mesh.position = pos;
    mesh.isVisible = true;

    const squareName = this.getSquareName(row, col);
    const existingMeta = mesh.metadata || {};
    const meta = {
      ...existingMeta,
      type, color, id, row, col, squareName,
      isFallback: !this.assets.arePiecesLoaded()
    };
    mesh.metadata = meta;

    // Propagate metadata to child meshes so click-picking works on sub-geometry
    mesh.getChildMeshes().forEach(child => { child.metadata = meta; });

    this.pieces.set(id, mesh);
    this.piecesBySquare.set(squareName, mesh);

    // Play idle standing animation immediately!
    this.playIdleAnimation(mesh);

    return mesh;
  }

  /**
   * Incremental sync — only removes captured pieces and places new ones.
   * Unmoved pieces are left completely untouched (no dispose/recreate).
   * Also replaces fallback primitives with 3D models when assets finish loading.
   */
  public syncBoardIncremental(boardState: (({ type: string; color: string } | null))[][]) {
    const expected = new Map<string, { type: string; color: string; row: number; col: number }>();
    const assetsLoaded = this.assets.arePiecesLoaded();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece) {
          const row = 7 - r;
          const squareName = this.getSquareName(row, c);
          expected.set(squareName, { type: piece.type, color: piece.color, row, col: c });
        }
      }
    }

    // Remove pieces that were captured, changed, or are fallback primitives when 3D models are now loaded
    for (const [squareName, mesh] of this.piecesBySquare) {
      const exp = expected.get(squareName);
      const isFallback = mesh.metadata?.isFallback ?? false;

      if (!exp || exp.type !== mesh.metadata.type || exp.color !== mesh.metadata.color || (isFallback && assetsLoaded)) {
        this.disposePiece(mesh);
      }
    }

    // Add pieces that are missing
    for (const [squareName, exp] of expected) {
      if (!this.piecesBySquare.has(squareName)) {
        this.createPiece(exp.type as PieceType, exp.color as PieceColor, squareName, exp.row, exp.col);
      }
    }
  }

  /** Full clear — used on game reset only. */
  public clearPieces() {
    for (const mesh of this.pieces.values()) {
      this.disposePiece(mesh);
    }
    this.pieces = new Map();
    this.piecesBySquare = new Map();
    this.clearSelection();
  }

  private disposePiece(mesh: AbstractMesh) {
    this.pieces.delete(mesh.metadata?.id);
    // Only evict from piecesBySquare if this mesh is still the current occupant.
    // If the attacker already moved here first, piecesBySquare[squareName] === attacker,
    // not this mesh, so we must NOT delete it (that would cause a ghost duplicate).
    const sq = mesh.metadata?.squareName as string | undefined;
    if (sq && this.piecesBySquare.get(sq) === mesh) {
      this.piecesBySquare.delete(sq);
    }
    mesh.dispose(false, false); // don't dispose shared materials
  }

  // ---------------------------------------------------------------------------
  // MESH BUILDING
  // ---------------------------------------------------------------------------

  private buildMesh(type: PieceType, color: PieceColor, id: string): AbstractMesh {
    // Try individual 3D piece models
    if (this.assets.arePiecesLoaded()) {
      const cloned = this.assets.clonePiece(type, color);
      if (cloned) {
        return this.prepareClonedMesh(cloned, type, color);
      }
    }

    // Fallback: geometric primitives
    return this.buildPrimitiveMesh(type, color, id);
  }

  /**
   * Normalize the cloned mesh size and orient it correctly on the board.
   */
  private prepareClonedMesh(mesh: AbstractMesh, type: PieceType, color: PieceColor): AbstractMesh {
    // Force world matrix update so bounding info is accurate
    mesh.computeWorldMatrix(true);

    // Collect all meshes in the hierarchy for bounding computation
    const allMeshes: AbstractMesh[] = [mesh, ...mesh.getChildMeshes()];

    // Find the tight Y-extent of the piece in its original scale
    let minY = Infinity;
    let maxY = -Infinity;
    allMeshes.forEach(m => {
      m.computeWorldMatrix(true);
      const info = m.getBoundingInfo();
      if (info) {
        minY = Math.min(minY, info.boundingBox.minimumWorld.y);
        maxY = Math.max(maxY, info.boundingBox.maximumWorld.y);
      }
    });

    const currentHeight = maxY - minY;
    let targetHeight = PIECE_TARGET_HEIGHTS[type] ?? 0.55;

    // Canon One Piece character height overrides
    if (color === 'w') {
      // Straw Hat Pirates (White side)
      if (type === 'p') {
        // Tony Tony Chopper - 90 cm cute doctor pawn!
        targetHeight = 0.45;
      } else if (type === 'r') {
        // Jinbei - 301 cm massive fishman helmsman!
        targetHeight = 0.96;
      } else if (type === 'n') {
        // Sanji - 180 cm master chef!
        targetHeight = 0.71;
      } else if (type === 'b') {
        // Roronoa Zoro - 181 cm swordsman!
        targetHeight = 0.71;
      } else if (type === 'q') {
        // Nami - 170 cm navigator!
        targetHeight = 0.66;
      } else if (type === 'k') {
        // Monkey D. Luffy - 174 cm King of the Pirates!
        targetHeight = 0.68;
      }
    } else {
      // Marines / World Government (Black side)
      if (type === 'p') {
        // Marine Soldier pawn
        targetHeight = 0.65;
      } else if (type === 'r') {
        // Fujitora (Issho) - 270 cm blind Admiral!
        targetHeight = 0.90;
      } else if (type === 'n') {
        // Borsalino (Kizaru) - 302 cm tall Admiral!
        targetHeight = 0.96;
      } else if (type === 'b') {
        // Sakazuki (Akainu) - 306 cm Fleet Admiral, the most imposing marine!
        targetHeight = 0.98;
      } else if (type === 'q') {
        // Kuzan (Aokiji) - 298 cm tall Admiral!
        targetHeight = 0.95;
      } else if (type === 'k') {
        // Sengoku - 279 cm former Fleet Admiral, Buddha form!
        targetHeight = 0.91;
      }
    }

    const scale = currentHeight > 0.0001 ? targetHeight / currentHeight : 1;

    mesh.scaling = new Vector3(scale, scale, scale);

    // Sit on the board surface
    // After scaling, the piece bottom is at minY * scale; we want it at 0.1 (board surface)
    mesh.position = new Vector3(0, 0.1 - minY * scale, 0);

    // White faces toward white's side (z+), black faces toward black's side (z-)
    mesh.rotationQuaternion = null;
    mesh.rotation = new Vector3(0, color === 'b' ? Math.PI : 0, 0);

    mesh.receiveShadows = true;
    mesh.getChildMeshes().forEach(c => { c.receiveShadows = true; });

    return mesh;
  }

  private buildPrimitiveMesh(type: PieceType, color: PieceColor, id: string): Mesh {
    const size = 0.6;
    let mesh: Mesh;

    switch (type) {
      case 'p':
        mesh = MeshBuilder.CreateCylinder('pawn', { diameter: size * 0.5, height: size * 0.9, tessellation: 12 }, this.scene);
        mesh.position.y = (size * 0.9) / 2;
        break;
      case 'r':
        mesh = MeshBuilder.CreateBox('rook', { size: size * 0.9 }, this.scene);
        mesh.position.y = (size * 0.9) / 2;
        break;
      case 'n':
        mesh = MeshBuilder.CreateCylinder('knight', { diameter: size * 0.8, height: size }, this.scene);
        mesh.position.y = size / 2;
        break;
      case 'b':
        mesh = MeshBuilder.CreateCylinder('bishop', { diameterTop: 0.1, diameterBottom: size * 0.8, height: size * 1.2 }, this.scene);
        mesh.position.y = (size * 1.2) / 2;
        break;
      case 'q':
        mesh = MeshBuilder.CreateTorus('queen', { diameter: size, thickness: 0.2 }, this.scene);
        mesh.position.y = 0.1;
        break;
      case 'k':
        mesh = MeshBuilder.CreateBox('king', { width: size * 0.5, height: size * 1.5, depth: size * 0.5 }, this.scene);
        mesh.position.y = (size * 1.5) / 2;
        break;
      default:
        mesh = MeshBuilder.CreateBox('piece', { size }, this.scene);
        mesh.position.y = size / 2;
    }

    mesh.material = this.getFallbackMaterial(color);
    mesh.receiveShadows = true;
    return mesh;
  }

  private getFallbackMaterial(color: PieceColor): PBRMaterial {
    if (color === 'w') {
      if (!this.matFallback_w) {
        this.matFallback_w = new PBRMaterial('pieceMat_w', this.scene);
        this.matFallback_w.albedoColor = new Color3(0.95, 0.95, 1.0);
        this.matFallback_w.emissiveColor = new Color3(0.1, 0.1, 0.2);
        this.matFallback_w.metallic = 0.8;
        this.matFallback_w.roughness = 0.2;
      }
      return this.matFallback_w;
    } else {
      if (!this.matFallback_b) {
        this.matFallback_b = new PBRMaterial('pieceMat_b', this.scene);
        this.matFallback_b.albedoColor = new Color3(0.15, 0.02, 0.02);
        this.matFallback_b.emissiveColor = new Color3(0.05, 0, 0);
        this.matFallback_b.metallic = 0.6;
        this.matFallback_b.roughness = 0.4;
      }
      return this.matFallback_b;
    }
  }

  // ---------------------------------------------------------------------------
  // MOVEMENT & CAPTURE
  // ---------------------------------------------------------------------------

  public getBoardPosition(row: number, col: number): Vector3 {
    return new Vector3(col - 3.5, 0.1, row - 3.5);
  }

  public async movePiece(id: string, toRow: number, toCol: number) {
    const piece = this.pieces.get(id);
    if (!piece) {
      console.error(`Move failed: Piece '${id}' not found.`);
      return;
    }

    const targetPos = this.getBoardPosition(toRow, toCol);
    // Keep the piece's custom base Y position intact so it sits perfectly on the board surface during the slide
    targetPos.y = piece.position.y;

    const hasAnimations = piece.metadata?.animationGroups && piece.metadata.animationGroups.length > 0;

    if (hasAnimations) {
      // 1. Play skeletal walk/run animation for rigged characters
      this.playWalkAnimation(piece);

      const animation = new Animation(
        'moveAnim', 'position', 60,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );

      animation.setKeys([
        { frame: 0, value: piece.position.clone() },
        { frame: 45, value: targetPos }
      ]);

      const easing = new QuadraticEase();
      easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
      animation.setEasingFunction(easing);

      piece.animations = [animation];
      await this.scene.beginAnimation(piece, 0, 45, false).waitAsync();

      // Revert back to idle standing animation once piece reaches destination!
      this.playIdleAnimation(piece);
    } else {
      // 2. Linear slide for static T-pose characters (sliding flat on the board surface, i.e. "running" straight)
      const animation = new Animation(
        'moveAnim', 'position', 60,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );

      animation.setKeys([
        { frame: 0, value: piece.position.clone() },
        { frame: 45, value: targetPos }
      ]);

      const easing = new QuadraticEase();
      easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
      animation.setEasingFunction(easing);

      piece.animations = [animation];
      await this.scene.beginAnimation(piece, 0, 45, false).waitAsync();
    }

    const oldSquare = piece.metadata.squareName;
    const newSquare = this.getSquareName(toRow, toCol);
    this.piecesBySquare.delete(oldSquare);
    piece.metadata.row = toRow;
    piece.metadata.col = toCol;
    piece.metadata.squareName = newSquare;
    this.piecesBySquare.set(newSquare, piece);
  }

  public getPieceAt(squareName: string): AbstractMesh | null {
    return this.piecesBySquare.get(squareName) || null;
  }

  public async capturePiece(id: string) {
    const piece = this.pieces.get(id);
    if (!piece) return;

    const hasAnimations = piece.metadata?.animationGroups && piece.metadata.animationGroups.length > 0;

    if (hasAnimations) {
      // Play death animation, then fade out via scaling
      this.playDeathAnimation(piece);
      // Wait for the death anim to play for 1.2s then shrink & dispose
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    // Shrink & disappear
    const anim = new Animation('capture', 'scaling', 60, Animation.ANIMATIONTYPE_VECTOR3);
    anim.setKeys([
      { frame: 0, value: piece.scaling.clone() },
      { frame: 20, value: Vector3.Zero() }
    ]);
    piece.animations = [anim];
    await this.scene.beginAnimation(piece, 0, 20, false).waitAsync();

    this.disposePiece(piece);
  }

  /** Play attack animation on the attacker piece (if it has skeleton animations) */
  public playAttackAnimation(id: string) {
    const piece = this.pieces.get(id);
    if (!piece) return;
    const hasAnimations = piece.metadata?.animationGroups && piece.metadata.animationGroups.length > 0;
    if (hasAnimations) {
      this.playAttackSkeletalAnimation(piece);
    }
  }

  /** Return a piece to its idle standing animation after attacking */
  public returnToIdle(id: string) {
    const piece = this.pieces.get(id);
    if (!piece) return;
    this.playIdleAnimation(piece);
  }

  // ---------------------------------------------------------------------------
  // SELECTION HIGHLIGHT
  // ---------------------------------------------------------------------------

  public highlightPiece(id: string) {
    const piece = this.pieces.get(id);
    if (!piece) return;

    if (!this.selectionRing) {
      this.selectionRing = MeshBuilder.CreateTorus('selectionRing', {
        diameter: 0.85,
        thickness: 0.05,
        tessellation: 32
      }, this.scene);

      const mat = new PBRMaterial('selectionRingMat', this.scene);
      mat.emissiveColor = new Color3(0, 0.8, 1);
      mat.albedoColor = new Color3(0, 0.4, 0.6);
      mat.transparencyMode = 2; // MATERIAL_ALPHABLEND
      mat.alpha = 0.6;
      this.selectionRing.material = mat;
    }

    this.selectionRing.isVisible = true;
    this.selectionRing.position = piece.position.clone();
    this.selectionRing.position.y = 0.12;
  }

  public clearSelection() {
    if (this.selectionRing) {
      this.selectionRing.isVisible = false;
    }
  }

  // ---------------------------------------------------------------------------
  // ANIMATION HELPERS
  // ---------------------------------------------------------------------------

  // Map of piece key -> animation codes for specific Fighting Path characters
  // Keys match `${type}_${color}` format.
  private static readonly ANIM_MAP: Record<string, { idle: string; walk: string; attack: string; death: string }> = {
    // ── Straw Hat Pirates (White side) ───────────────────────────────────────────
    // Monkey D. Luffy (king white)   — monkey_d_luffy.glb (Bounty Rush, 30 Luffy + 30 Nami)
    'k_w': { idle: 'pl_luffy_topw01_idle_a',  walk: 'pl_luffy_topw01_run',  attack: 'pl_luffy_topw01_combo_a', death: 'pl_luffy_topw01_down' },
    // Nami (queen white)             — one_piece_nami.glb (Bounty Rush, 30 Nami)
    'q_w': { idle: 'pl_nami_2yaf01_idle_a',   walk: 'pl_nami_2yaf01_run',   attack: 'pl_nami_2yaf01_combo_a',  death: 'pl_nami_2yaf01_down' },
    // Roronoa Zoro (bishop white)    — zoro_-_one_piece.glb (Fighting Path, 86 anims)
    'b_w': { idle: '0011_Low',                walk: '0110_Low',              attack: '3001_Low',                death: '6011_Low' },
    // Sanji (knight white)           — one_piece_sanji.glb (Bounty Rush, 30 Sanji + 30 Luffy + 30 Nami)
    'n_w': { idle: 'pl_sanji_atta01_idle_a',  walk: 'pl_sanji_atta01_run',  attack: 'pl_sanji_atta01_combo_a', death: 'pl_sanji_atta01_down' },
    // ── Marines / World Government (Black side) ──────────────────────────────────
    // Captain Koby (bishop black)    — one_piece_fighting_path_koby.glb (Fighting Path)
    'b_b': { idle: '0011',                    walk: '0110',                  attack: '0321',                    death: '6011' },
  };

  private getAnimationForPiece(piece: AbstractMesh, role: 'idle' | 'walk' | 'attack' | 'death'): AnimationGroup | undefined {
    const ags = piece.metadata?.animationGroups as AnimationGroup[];
    if (!ags || ags.length === 0) return undefined;

    const key = `${piece.metadata?.type}_${piece.metadata?.color}`;
    const map = PieceRenderer.ANIM_MAP[key];

    // 1. Try exact-match from the map
    if (map) {
      const code = map[role];
      const exact = ags.find(ag => ag.name === code || ag.name.startsWith(code));
      if (exact) return exact;
    }

    // 2. Fall back to keyword matching
    const keywords: Record<string, string[]> = {
      idle:   ['idle', 'wait', 'stand', 'pose', 'default'],
      walk:   ['walk', 'run', 'move', 'jog', '0110', '0021'],
      attack: ['attack', 'combo', 'slash', 'hit', '3001', '1011', '0321'],
      death:  ['death', 'die', 'down', 'dead', 'fall', '6011'],
    };
    const found = ags.find(ag => keywords[role].some(kw => ag.name.toLowerCase().includes(kw)));
    if (found) return found;

    // 3. Last resort: first animation
    return ags[0];
  }

  private playIdleAnimation(piece: AbstractMesh) {
    const ags = piece.metadata?.animationGroups as AnimationGroup[];
    if (!ags || ags.length === 0) return;
    ags.forEach(ag => ag.stop());
    const ag = this.getAnimationForPiece(piece, 'idle');
    if (ag) ag.start(true);
  }

  private playWalkAnimation(piece: AbstractMesh) {
    const ags = piece.metadata?.animationGroups as AnimationGroup[];
    if (!ags || ags.length === 0) return;
    ags.forEach(ag => ag.stop());
    const ag = this.getAnimationForPiece(piece, 'walk');
    if (ag) ag.start(true);
  }

  private playAttackSkeletalAnimation(piece: AbstractMesh) {
    const ags = piece.metadata?.animationGroups as AnimationGroup[];
    if (!ags || ags.length === 0) return;
    ags.forEach(ag => ag.stop());
    const ag = this.getAnimationForPiece(piece, 'attack');
    if (ag) ag.start(false); // play once — attacker snaps back to idle after
  }

  private playDeathAnimation(piece: AbstractMesh) {
    const ags = piece.metadata?.animationGroups as AnimationGroup[];
    if (!ags || ags.length === 0) return;
    ags.forEach(ag => ag.stop());
    const ag = this.getAnimationForPiece(piece, 'death');
    if (ag) ag.start(false); // play once
  }

  private getSquareName(row: number, col: number): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[col]}${row + 1}`;
  }
}
