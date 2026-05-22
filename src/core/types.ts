export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  id: string; // Unique ID for 3D model mapping
}

export interface Square {
  file: string;
  rank: number;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export interface GameState {
  fen: string;
  turn: PieceColor;
  isGameOver: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  winner: PieceColor | null;
  history: string[];
}
