import { Chess } from 'chess.js';

const pieceValues: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

function evaluateBoard(game: Chess): number {
  let total = 0;
  const board = game.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (!piece) continue;
      const val = pieceValues[piece.type] ?? 0;
      total += piece.color === 'w' ? val : -val;
    }
  }
  // Return from the current player's perspective
  return game.turn() === 'w' ? total : -total;
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
): number {
  if (depth === 0) return evaluateBoard(game);

  const moves = game.moves();
  if (moves.length === 0) return evaluateBoard(game);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      if (evaluation > maxEval) maxEval = evaluation;
      if (maxEval > alpha) alpha = maxEval;
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      if (evaluation < minEval) minEval = evaluation;
      if (minEval < beta) beta = minEval;
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

self.onmessage = (e: MessageEvent<{ fen: string; depth?: number }>) => {
  const { fen, depth = 3 } = e.data;

  const game = new Chess(fen);
  const moves = game.moves();

  if (moves.length === 0) {
    self.postMessage({ move: null });
    return;
  }

  let bestMove: string | null = null;
  let bestValue = -Infinity;

  for (const move of moves) {
    game.move(move);
    const boardValue = -minimax(game, depth - 1, -Infinity, Infinity, false);
    game.undo();
    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  self.postMessage({ move: bestMove });
};
