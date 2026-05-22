import { Chess, Move as ChessMove } from 'chess.js';
import type { GameState, Move } from './types';

export class ChessGame {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  public getBoard() {
    return this.chess.board();
  }

  public getFEN(): string {
    return this.chess.fen();
  }

  public makeMove(move: Move | string): ChessMove | null {
    try {
      return this.chess.move(move);
    } catch (e) {
      return null;
    }
  }

  public getValidMoves(square?: string) {
    if (square) {
      // For chess.js v1.0.0-beta, moves returns objects or strings based on options
      return this.chess.moves({ square: square as any, verbose: true });
    }
    return this.chess.moves({ verbose: true });
  }

  public getGameState(): GameState {
    return {
      fen: this.chess.fen(),
      turn: this.chess.turn() as 'w' | 'b',
      isGameOver: this.chess.isGameOver(),
      isCheck: this.chess.isCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw(),
      winner: this.chess.isCheckmate() ? (this.chess.turn() === 'w' ? 'b' : 'w') : null,
      history: this.chess.history()
    };
  }

  public undo() {
    return this.chess.undo();
  }

  public reset() {
    this.chess.reset();
  }

  public load(fen: string) {
    this.chess.load(fen);
  }

  public getAllValidMoves() {
    return this.chess.moves({ verbose: true });
  }
}
