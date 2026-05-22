import {
  Scene,
  MeshBuilder,
  Color3,
  Vector3,
  PBRMaterial,
  Mesh
} from '@babylonjs/core';

export class BoardRenderer {
  private scene: Scene;
  private squares: Mesh[][] = [];
  private readonly BOARD_SIZE = 8;
  private readonly SQUARE_SIZE = 1;

  // Shared base materials for the One Piece Grand Line Chess board
  private lightSquareMat!: PBRMaterial;
  private darkSquareMat!: PBRMaterial;

  // Lazily-created per-square highlight materials (only for highlighted squares)
  private highlightMats: Map<string, PBRMaterial> = new Map();
  // Currently highlighted squares
  private highlighted: Set<string> = new Set();

  constructor(scene: Scene) {
    this.scene = scene;
    this.createBoard();
    this.createWaterPlane();
  }

  private createBoard() {
    // Light squares: Sandy golden beach / Straw Hat theme
    this.lightSquareMat = new PBRMaterial('lightSquareMat', this.scene);
    this.lightSquareMat.albedoColor = new Color3(0.9, 0.82, 0.65);
    this.lightSquareMat.roughness = 0.2;
    this.lightSquareMat.metallic = 0.6;
    this.lightSquareMat.freeze();

    // Dark squares: Deep Caribbean Navy / ocean blue theme
    this.darkSquareMat = new PBRMaterial('darkSquareMat', this.scene);
    this.darkSquareMat.albedoColor = new Color3(0.05, 0.18, 0.32);
    this.darkSquareMat.roughness = 0.15;
    this.darkSquareMat.metallic = 0.8;
    this.darkSquareMat.freeze();

    for (let row = 0; row < this.BOARD_SIZE; row++) {
      this.squares[row] = [];
      for (let col = 0; col < this.BOARD_SIZE; col++) {
        const isLight = (row + col) % 2 === 0;
        const square = MeshBuilder.CreateBox(
          `square_${row}_${col}`,
          { width: this.SQUARE_SIZE, height: 0.2, depth: this.SQUARE_SIZE },
          this.scene
        );

        square.position = new Vector3(
          col - (this.BOARD_SIZE - 1) / 2,
          0,
          row - (this.BOARD_SIZE - 1) / 2
        );

        // Share base material — never clone for normal squares
        square.material = isLight ? this.lightSquareMat : this.darkSquareMat;
        square.receiveShadows = true;
        square.metadata = {
          row,
          col,
          squareName: this.getSquareName(row, col),
          isLight
        };

        this.squares[row][col] = square;
      }
    }

    this.createBoardFrame();
  }

  private createBoardFrame() {
    const frame = MeshBuilder.CreateBox('boardFrame', {
      width: this.BOARD_SIZE + 0.5,
      height: 0.15,
      depth: this.BOARD_SIZE + 0.5
    }, this.scene);
    frame.position.y = -0.05;

    // Golden Royal Marine / Pirate Gold trim frame
    const frameMat = new PBRMaterial('frameMat', this.scene);
    frameMat.albedoColor = new Color3(0.92, 0.72, 0.18);
    frameMat.metallic = 0.95;
    frameMat.roughness = 0.1;
    frameMat.freeze();
    frame.material = frameMat;
  }

  /**
   * Floating 3D Semi-translucent ocean water surface directly below the board.
   */
  private createWaterPlane() {
    const water = MeshBuilder.CreateDisc('oceanWater', { radius: 6.5, tessellation: 64 }, this.scene);
    water.rotation.x = Math.PI / 2;
    // Position slightly below the gold frame for a gorgeous floating look
    water.position.y = -0.13;

    const waterMat = new PBRMaterial('waterMat', this.scene);
    waterMat.albedoColor = new Color3(0.01, 0.18, 0.32);
    waterMat.metallic = 0.95;
    waterMat.roughness = 0.08;
    waterMat.transparencyMode = 1;
    waterMat.alpha = 0.7; // Beautiful translucent blend
    waterMat.emissiveColor = new Color3(0.02, 0.12, 0.18); // soft bioluminescent ocean glow
    waterMat.freeze();

    water.material = waterMat;
    water.receiveShadows = true;
  }

  public highlightSquare(row: number, col: number, color: Color3 = new Color3(1, 0.8, 0)) {
    const square = this.squares[row][col];
    const key = `${row}_${col}`;

    // Lazy-create a unique highlight material for this square (reuse if already exists)
    if (!this.highlightMats.has(key)) {
      const mat = new PBRMaterial(`hlMat_${key}`, this.scene);
      mat.roughness = 0.3;
      mat.metallic = 0.2;
      this.highlightMats.set(key, mat);
    }

    const mat = this.highlightMats.get(key)!;
    mat.albedoColor = color;
    mat.emissiveColor = color.scale(0.4);

    square.material = mat;
    this.highlighted.add(key);
  }

  public clearHighlights() {
    for (const key of this.highlighted) {
      const [row, col] = key.split('_').map(Number);
      const square = this.squares[row][col];
      const isLight = square.metadata.isLight as boolean;
      // Restore the shared base material (no clone needed)
      square.material = isLight ? this.lightSquareMat : this.darkSquareMat;
    }
    this.highlighted.clear();
  }

  private getSquareName(row: number, col: number): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[col]}${row + 1}`;
  }

  public getSquarePosition(row: number, col: number): Vector3 {
    return new Vector3(
      col - (this.BOARD_SIZE - 1) / 2,
      0.1,
      row - (this.BOARD_SIZE - 1) / 2
    );
  }
}
