<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import { useGameStore } from '../stores/gameStore';

const authStore = useAuthStore();
const multiplayerStore = useMultiplayerStore();
const gameStore = useGameStore();
const router = useRouter();

const showSideSelection = ref(false);

onMounted(() => {
  authStore.init();
});

const handleMultiplayer = async () => {
  if (authStore.user) {
    router.push('/lobby');
  }
};

const selectSide = (side: 'w' | 'b') => {
  gameStore.setPlayerColor(side);
  gameStore.resetGame();
  showSideSelection.value = false;
  router.push('/game');
};

const userBounty = computed(() => {
  if (!authStore.user) return '0';
  const uid = authStore.user.uid || '';
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rawBounty = Math.abs(hash) % 470000000 + 30000000; // Between 30M and 500M
  return rawBounty.toLocaleString('es-ES');
});

const userRank = computed(() => {
  if (!authStore.user) return '';
  const email = authStore.user.email || '';
  if (email.includes('admin')) return 'Almirante de la Flota';
  const uid = authStore.user.uid || '';
  const index = uid.charCodeAt(0) % 4;
  const ranks = ['Supernova', 'Capitán de la Flota', 'Vicealmirante', 'Cazador de Piratas'];
  return ranks[index];
});
</script>


<template>
  <div class="main-menu">
    <div class="menu-content">
      <div class="title-section">
        <h1 class="game-title">One Piece</h1>
        <h2 class="sub-title">Grand Line Chess</h2>
      </div>

      <!-- Premium Crew Member / Auth Card -->
      <div class="profile-card" v-if="authStore.user">
        <div class="profile-header">
          <div class="avatar-frame">
            <img 
              v-if="authStore.user.photoURL" 
              :src="authStore.user.photoURL" 
              class="avatar-img"
              alt="Pirate Avatar"
            />
            <div v-else class="avatar-placeholder">
              <span class="avatar-initial">{{ (authStore.user.displayName || 'P').charAt(0).toUpperCase() }}</span>
            </div>
            <div class="gold-ring"></div>
          </div>
          <div class="profile-info">
            <div class="rank-badge">{{ userRank }}</div>
            <h3 class="profile-name">{{ authStore.user.displayName || 'Pirata Anónimo' }}</h3>
            <p class="profile-bounty">Recompensa: <span>{{ userBounty }} ฿</span></p>
          </div>
        </div>
        <button @click="authStore.logout" class="btn-logout-premium">
          <span class="btn-logout-icon">⚓</span> Abandonar la Grand Line
        </button>
      </div>
      
      <div class="lobby-auth-prompt" v-else>
        <p class="prompt-text">¿Quieres cruzar el Nuevo Mundo?</p>
        <button @click="router.push('/login')" class="btn-login-premium">
          <span class="btn-login-icon">☠️</span> UNIRSE A LA TRIPULACIÓN
        </button>
      </div>

      <div class="menu-actions">
        <button @click="showSideSelection = true" class="menu-btn primary">
          <span class="btn-text">Local Battle</span>
          <span class="btn-desc">Challenge the AI or a Friend</span>
        </button>

        <button class="menu-btn secondary" :disabled="!authStore.user" @click="handleMultiplayer">
          <span class="btn-text">Multiplayer</span>
          <span class="btn-desc">{{ authStore.user ? 'Enter the Arena' : 'Login to Play Online' }}</span>
        </button>

        <button class="menu-btn ghost">
          <span class="btn-text">Settings</span>
        </button>
      </div>

      <div class="footer">
        <p>Become the King of the Pirates!</p>
      </div>
    </div>

    <!-- Side Selection Modal -->
    <Transition name="fade">
      <div v-if="showSideSelection" class="modal-overlay" @click.self="showSideSelection = false">
        <div class="modal-content side-selection">
          <h3>Choose Your Allegiance</h3>
          <p>The fate of the Grand Line depends on your decision.</p>
          
          <div class="side-options">
            <button @click="selectSide('w')" class="side-btn white">
              <div class="side-icon">
                <img src="/Piratas_de_Sombrero_de_Paja_bandera.webp" alt="Piratas de Sombrero de Paja" class="side-flag" />
              </div>
              <span class="side-name">Straw Hat Pirates</span>
              <span class="side-desc">Set sail with Luffy's crew</span>
            </button>

            <button @click="selectSide('b')" class="side-btn black">
              <div class="side-icon">
                <img src="/Marine_bandera.webp" alt="La Marina" class="side-flag" />
              </div>
              <span class="side-name">The Navy / Marines</span>
              <span class="side-desc">Enforce absolute justice</span>
            </button>
          </div>

          <button @click="showSideSelection = false" class="btn-cancel">Back</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.main-menu {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #0a1f33 0%, #03080e 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: 'Cinzel', serif;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 2.5rem 1.5rem; /* Safe vertical and horizontal cushion for desktop */
}

.menu-content {
  text-align: center;
  max-width: 600px;
  width: 100%;
  padding: 2rem 2.5rem; /* Elegant padding that saves vertical space */
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  box-sizing: border-box;
  margin: auto; /* Perfectly centers when fits, and scrolls from top when overflows */
  display: flex;
  flex-direction: column;
}

.game-title {
  font-size: 4rem;
  margin: 0;
  letter-spacing: 8px;
  background: linear-gradient(to bottom, #d4af37, #f1d592);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sub-title {
  font-size: 1.5rem;
  margin-top: -10px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 4px;
}

.menu-actions {
  margin-top: 2.25rem; /* Saved 28px */
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.menu-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.5);
  padding: 1.25rem; /* Visual balance */
  color: white;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-btn:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.1);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
  transform: translateY(-2px);
  border-color: #d4af37;
}

.menu-btn.primary {
  background: rgba(212, 175, 55, 0.15);
}

.menu-btn.primary:hover {
  background: rgba(212, 175, 55, 0.25);
}

.btn-text {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.btn-desc {
  font-size: 0.8rem;
  opacity: 0.6;
  margin-top: 5px;
}

.menu-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #444;
}

.footer {
  margin-top: 2.25rem; /* Saved 28px */
  font-size: 0.8rem;
  opacity: 0.4;
}

/* Premium profile card styling */
.profile-card {
  margin-top: 1.5rem; /* Saved 8px */
  padding: 1.25rem; /* Sleeker padding */
  background: rgba(4, 12, 22, 0.5);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5),
              0 0 15px rgba(212, 175, 55, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.profile-card:hover {
  border-color: rgba(212, 175, 55, 0.6);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6),
              0 0 20px rgba(212, 175, 55, 0.15);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  text-align: left;
}

.avatar-frame {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #ffe699 0%, #d4af37 50%, #8a6d1c 100%);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #040c16;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, #0b1d33 0%, #030a14 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #040c16;
}

.avatar-initial {
  font-size: 1.8rem;
  font-weight: bold;
  color: #d4af37;
  font-family: 'Cinzel', serif;
  text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
}

.gold-ring {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  border: 1px solid rgba(212, 175, 55, 0.5);
  pointer-events: none;
  animation: rotateGlow 8s linear infinite;
}

@keyframes rotateGlow {
  0% { transform: rotate(0deg); opacity: 0.5; }
  50% { opacity: 0.8; }
  100% { transform: rotate(360deg); opacity: 0.5; }
}

.profile-info {
  flex: 1;
}

.rank-badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.4);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  font-weight: bold;
  margin-bottom: 0.35rem;
}

.profile-name {
  font-size: 1.25rem;
  margin: 0 0 0.2rem;
  color: #fff;
  font-weight: 700;
  font-family: 'Cinzel', serif;
}

.profile-bounty {
  font-size: 0.8rem;
  color: #a0aec0;
  margin: 0;
}

.profile-bounty span {
  color: #d4af37;
  font-weight: bold;
}

.btn-logout-premium {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.4);
  color: #d4af37;
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  font-family: 'Cinzel', serif;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-logout-premium:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
}

.btn-logout-icon {
  font-size: 1rem;
}

/* Prompt styles */
.lobby-auth-prompt {
  margin-top: 1.5rem; /* Saved 8px */
  padding: 1.25rem;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.prompt-text {
  font-size: 0.9rem;
  color: #a0aec0;
  margin: 0;
}

.btn-login-premium {
  background: linear-gradient(to right, #8a6d1c 0%, #d4af37 50%, #8a6d1c 100%);
  background-size: 200% auto;
  border: 1px solid #d4af37;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  color: #040c16;
  font-size: 1rem;
  font-weight: bold;
  font-family: 'Cinzel', serif;
  letter-spacing: 1.5px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
              0 0 10px rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-login-premium:hover {
  background-position: right center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4),
              0 0 18px rgba(212, 175, 55, 0.4);
  transform: translateY(-1px);
}


@media (max-width: 600px) {
  .main-menu {
    padding: 1.5rem 1rem; /* Sleek cushion for mobile viewport */
  }
  .menu-content {
    padding: 1.5rem 1.25rem;
    width: 100%;
    box-sizing: border-box;
  }
  .game-title { font-size: 2.5rem; letter-spacing: 4px; }
  .menu-btn { padding: 1rem; }
  .btn-text { font-size: 1.1rem; }
  .side-options { flex-direction: column; gap: 1rem; margin: 1.5rem 0; }
  .modal-content.side-selection { padding: 1.5rem; width: 95%; }
  .modal-content.side-selection h3 { font-size: 1.8rem; }
  .side-btn { padding: 1rem; }
  .side-flag { width: 60px; height: 60px; }
  .side-icon { height: 64px; margin-bottom: 0.5rem; }
  .side-name { font-size: 1.1rem; }
  .side-desc { font-size: 0.75rem; }
  .menu-actions { margin-top: 1.5rem !important; }
  .profile-card { margin-top: 1.25rem !important; }
  .footer { margin-top: 1.5rem !important; }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  overflow-y: auto;
  padding: 2rem 0;
  box-sizing: border-box;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.modal-content.side-selection {
  background: #0a0a0a;
  padding: 3rem;
  border-radius: 15px;
  border: 1px solid #d4af37;
  max-width: 800px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 50px rgba(212, 175, 55, 0.15);
  margin: auto;
  box-sizing: border-box;
}

h3 {
  font-size: 2.5rem;
  color: #d4af37;
  margin-bottom: 0.5rem;
}

.side-options {
  display: flex;
  gap: 2rem;
  margin: 3rem 0;
}

.side-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 12px;
}

.side-icon {
  margin-bottom: 1.25rem;
  transition: transform 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

.side-flag {
  width: 76px;
  height: 76px;
  object-fit: cover;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6));
  border-radius: 50%;
  border: 2px solid #d4af37;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.25);
  transition: all 0.3s ease;
}

.side-name {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 0.5rem;
}

.side-desc {
  font-size: 0.8rem;
  color: #888;
}

.side-btn.white:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: #f1f1f1;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
}

.side-btn.black:hover {
  background: rgba(255, 0, 0, 0.05);
  border-color: #ff4d4d;
  box-shadow: 0 0 30px rgba(255, 77, 77, 0.1);
}

.side-btn:hover .side-icon {
  transform: scale(1.2) rotate(5deg);
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  transition: color 0.3s;
}

.btn-cancel:hover {
  color: #d4af37;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
