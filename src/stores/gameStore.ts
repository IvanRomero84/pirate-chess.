import { defineStore } from 'pinia';
import { ChessGame } from '../core/ChessGame';
import type { GameState, Move } from '../core/types';

export const useGameStore = defineStore('game', {
  state: () => ({
    game: new ChessGame(),
    selectedSquare: null as string | null,
    validMoves: [] as any[],
    playerColor: 'w' as 'w' | 'b',
    status: {
      turn: 'w',
      isCheck: false,
      isCheckmate: false,
      isDraw: false,
      isGameOver: false,
      winner: null as string | null,
      fen: '',
    },
    isMultiplayer: false,
    isMyTurn: true,
    viewMode: '3d' as '2d' | '3d',
    chatExpanded: true,
    unreadMessages: 0,
    engineError: null as string | null,
  }),

  actions: {
    setPlayerColor(color: 'w' | 'b') {
      this.playerColor = color;
    },
    initGame() {
      this.updateStatus();
    },

    updateStatus() {
      this.status = this.game.getGameState();
      this.isMyTurn = this.status.turn === this.playerColor;
    },

    selectSquare(square: string) {
      if (this.selectedSquare === square) {
        this.selectedSquare = null;
        this.validMoves = [];
        return;
      }

      this.selectedSquare = square;
      this.validMoves = this.game.getValidMoves(square);
    },

    async makeMove(move: Move) {
      const result = this.game.makeMove(move);
      if (result) {
        this.updateStatus();
        this.selectedSquare = null;
        this.validMoves = [];
        return true;
      }
      return false;
    },

    resetGame() {
      this.game.reset();
      this.updateStatus();
      this.selectedSquare = null;
      this.validMoves = [];
    },

    setViewMode(mode: '2d' | '3d') {
      this.viewMode = mode;
    },

    toggleChat() {
      this.chatExpanded = !this.chatExpanded;
      if (this.chatExpanded) {
        this.unreadMessages = 0;
      }
    },

    incrementUnread() {
      if (!this.chatExpanded) {
        this.unreadMessages++;
      }
    },

    resetUnread() {
      this.unreadMessages = 0;
    }
  }
});
