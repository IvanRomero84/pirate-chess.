import { Chess } from 'chess.js';

export class ChessAI {
  private readonly pieceValues: Record<string, number> = {
    p: 10,
    n: 30,
    b: 30,
    r: 50,
    q: 90,
    k: 900
  };

  public getBestMove(fen: string, depth: number = 3): string | null {
    const game = new Chess(fen);
    const moves = game.moves();
    
    if (moves.length === 0) return null;

    let bestMove = null;
    let bestValue = -Infinity;

    for (const move of moves) {
      game.move(move);
      const boardValue = -this.minimax(game, depth - 1, -Infinity, Infinity, false);
      game.undo();

      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0) {
      return this.evaluateBoard(game);
    }

    const moves = game.moves();

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        game.move(move);
        const evaluation = this.minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        game.move(move);
        const evaluation = this.minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private evaluateBoard(game: Chess): number {
    let totalEvaluation = 0;
    const board = game.board();

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        totalEvaluation += this.getPieceValue(board[i][j], i, j);
      }
    }
    
    // Perspective based on turn
    return game.turn() === 'w' ? totalEvaluation : -totalEvaluation;
  }

  private getPieceValue(piece: any, x: number, y: number): number {
    if (piece === null) return 0;
    
    const absoluteValue = this.pieceValues[piece.type] || 0;
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
  }
}
