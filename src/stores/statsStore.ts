import { defineStore } from 'pinia';
import { dbService } from '../services/dbService';
import { useAuthStore } from './authStore';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useStatsStore = defineStore('stats', {
  state: () => ({
    wins: 0,
    losses: 0,
    elo: 1000,
  }),

  actions: {
    async fetchStats() {
      const authStore = useAuthStore();
      if (!authStore.user) return;

      const docRef = doc(db, 'users', authStore.user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.wins = data.wins || 0;
        this.losses = data.losses || 0;
        this.elo = data.elo || 1000;
      } else {
        // Init stats
        await setDoc(docRef, { wins: 0, losses: 0, elo: 1000 });
      }
    },

    async recordWin() {
      const authStore = useAuthStore();
      if (!authStore.user) return;

      const docRef = doc(db, 'users', authStore.user.uid);
      await updateDoc(docRef, {
        wins: increment(1),
        elo: increment(25)
      });
      this.wins++;
      this.elo += 25;
    },

    async recordLoss() {
      const authStore = useAuthStore();
      if (!authStore.user) return;

      const docRef = doc(db, 'users', authStore.user.uid);
      await updateDoc(docRef, {
        losses: increment(1),
        elo: increment(-15)
      });
      this.losses++;
      this.elo -= 15;
    }
  }
});
