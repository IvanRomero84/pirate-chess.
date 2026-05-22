<template>
  <div class="lobby">
    <div class="lobby-card">
      <div class="lobby-header">
        <h2>Active Game Rooms</h2>
        <button @click="multiplayerStore.createRoom" class="btn-create">Create New Room</button>
      </div>

      <div class="rooms-list">
        <div v-if="loading" class="loading">Searching the Grand Line...</div>
        <div v-else-if="rooms.length === 0" class="empty">No active battles found. Start your own voyage!</div>
        
        <div v-for="room in rooms" :key="room.id" class="room-item">
          <div class="room-info">
            <span class="host-name">{{ room.hostName }}'s Fleet</span>
            <span class="status" :class="room.status">{{ room.status }}</span>
          </div>
          <button 
            @click="joinRoom(room.id)" 
            :disabled="room.status !== 'waiting'"
            class="btn-join"
          >
            Join Battle
          </button>
        </div>
      </div>

      <router-link to="/" class="btn-back">Return to Menu</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const multiplayerStore = useMultiplayerStore();
const router = useRouter();
const rooms = ref<any[]>([]);
const loading = ref(true);

onMounted(() => {
  const q = query(collection(db, 'games'), where('status', '==', 'waiting'));
  
  onSnapshot(q, (snapshot) => {
    rooms.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loading.value = false;
  });
});

const joinRoom = async (id: string) => {
  await multiplayerStore.joinRoom(id);
  router.push('/game');
};
</script>

<style scoped>
.lobby {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle, #1a1a2e 0%, #0a0a0f 100%);
  font-family: 'Cinzel', serif;
}

.lobby-card {
  width: 100%;
  max-width: 800px;
  background: rgba(10, 10, 15, 0.9);
  border: 1px solid #d4af37;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
}

.lobby-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.rooms-list {
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

.room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.room-item:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.05);
}

.host-name {
  font-size: 1.2rem;
  color: #fff;
}

.status {
  display: block;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-top: 5px;
}

.status.waiting { color: #00ff00; }
.status.active { color: #d4af37; }

.btn-create, .btn-join {
  background: #d4af37;
  color: #000;
  border: none;
  padding: 0.8rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  font-family: 'Cinzel', serif;
  transition: all 0.3s ease;
}

.btn-join:disabled {
  background: #444;
  cursor: not-allowed;
}

.btn-back {
  display: block;
  margin-top: 2rem;
  text-align: center;
  color: #aaa;
  text-decoration: none;
}

@media (max-width: 600px) {
  .lobby-card {
    padding: 1rem;
    margin: 1rem;
  }
  
  .room-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .host-name {
    font-size: 1rem;
  }
}
</style>
