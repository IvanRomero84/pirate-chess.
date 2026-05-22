import { defineStore } from 'pinia';
import { dbService } from '../services/dbService';
import { useGameStore } from './gameStore';
import { useAuthStore } from './authStore';

export const useMultiplayerStore = defineStore('multiplayer', {
  state: () => ({
    currentGameId: null as string | null,
    opponent: null as any,
    isHost: false,
    isConnected: false,
    lobbyGames: [] as any[],
    messages: [] as any[],
  }),

  actions: {
    // ... other actions
    async sendMessage(text: string) {
      if (!this.currentGameId) return;
      const authStore = useAuthStore();
      
      const message = {
        text,
        senderId: authStore.user?.uid,
        senderName: authStore.user?.displayName || 'Warrior',
        timestamp: new Date()
      };

      await dbService.updateGame(this.currentGameId, {
        messages: [...this.messages, message]
      });
    },
    async createRoom() {
      const authStore = useAuthStore();
      const gameStore = useGameStore();

      if (!authStore.user) return;

      const gameData = {
        hostId: authStore.user.uid,
        hostName: authStore.user.displayName || 'Light Side',
        status: 'waiting',
        fen: gameStore.game.getFEN(),
        createdAt: new Date(),
        turn: 'w',
      };

      const docRef = await dbService.createGame(gameData);
      this.currentGameId = docRef.id;
      this.isHost = true;
      this.listenToRoom(this.currentGameId);
    },

    async joinRoom(gameId: string) {
      const authStore = useAuthStore();
      const gameStore = useGameStore();

      if (!authStore.user) return;

      await dbService.updateGame(gameId, {
        opponentId: authStore.user.uid,
        opponentName: authStore.user.displayName || 'Dark Side',
        status: 'active'
      });

      this.currentGameId = gameId;
      this.isHost = false;
      this.listenToRoom(gameId);
    },

    listenToRoom(gameId: string) {
      const gameStore = useGameStore();
      
      dbService.listenToGame(gameId, (data) => {
        if (!data) return;

        // Sync FEN if it changed and it's not my turn
        if (data.fen !== gameStore.game.getFEN()) {
          gameStore.game.load(data.fen);
          gameStore.updateStatus();
        }

        if (data.messages) {
          this.messages = data.messages;
        }

        this.isConnected = true;
        this.opponent = this.isHost ? 
          { id: data.opponentId, name: data.opponentName } : 
          { id: data.hostId, name: data.hostName };
      });
    },

    async syncMove(fen: string) {
      if (!this.currentGameId) return;
      await dbService.updateGame(this.currentGameId, { fen });
    }
  }
});
