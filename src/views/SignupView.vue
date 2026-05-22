<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptPirateCode = ref(false);
const validationError = ref<string | null>(null);

// Password strength calculation
const passwordStrength = computed(() => {
  const p = password.value;
  if (!p) return { score: 0, label: '', color: '#4a5568' };
  
  let score = 0;
  if (p.length >= 6) score += 1;
  if (p.length >= 10) score += 1;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score += 1;
  
  if (score <= 1) {
    return { score: 1, label: 'Contraseña de Grumete (Débil)', color: '#f56565' };
  } else if (score === 2) {
    return { score: 2, label: 'Contraseña de Oficial (Media)', color: '#ecc94b' };
  } else {
    return { score: 3, label: 'Contraseña de Capitán (¡Segura!)', color: '#48bb78' };
  }
});

const handleSignup = async () => {
  validationError.value = null;

  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    validationError.value = '¡Falta información, tripulante! Llena todos los campos para enrolarte.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    validationError.value = '¡Las contraseñas no encajan! Son como dos mapas del tesoro diferentes.';
    return;
  }

  if (password.value.length < 6) {
    validationError.value = '¡Tu contraseña es demasiado débil! Necesitamos al menos 6 caracteres para proteger tu botín.';
    return;
  }

  if (!acceptPirateCode.value) {
    validationError.value = 'Debes jurar lealtad aceptando el Código Pirata antes de abordar.';
    return;
  }

  const success = await authStore.register(email.value, password.value, username.value);
  if (success) {
    // Wait a brief second to show success and redirect
    setTimeout(() => {
      router.push('/');
    }, 1500);
  }
};
</script>

<template>
  <div class="signup-container">
    <!-- Animated background layers -->
    <div class="sea-mist"></div>
    <div class="stormy-bg"></div>

    <div class="signup-card">
      <div class="logo-section">
        <h1 class="logo-title">One Piece</h1>
        <h2 class="logo-subtitle">Grand Line Chess</h2>
        <div class="gold-divider"></div>
      </div>

      <div class="card-intro">
        <h3>Únete a la Tripulación</h3>
        <p>Registra tu nombre en el cartel de Se Busca (WANTED)</p>
      </div>

      <!-- Notification Alerts -->
      <Transition name="slide-up">
        <div v-if="authStore.errorMessage || validationError" class="alert error-alert">
          <span class="alert-icon">☠️</span>
          <p class="alert-text">{{ authStore.errorMessage || validationError }}</p>
        </div>
      </Transition>

      <Transition name="slide-up">
        <div v-if="authStore.successMessage" class="alert success-alert">
          <span class="alert-icon">⚓</span>
          <p class="alert-text">{{ authStore.successMessage }}</p>
        </div>
      </Transition>

      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="input-group">
          <label for="username">Apodo de Pirata (Nombre)</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input 
              v-model="username" 
              type="text" 
              id="username" 
              placeholder="Ej. Luffy D. Monkey" 
              required
              :disabled="authStore.actionLoading"
            />
          </div>
        </div>

        <div class="input-group">
          <label for="email">Dirección de Correo</label>
          <div class="input-wrapper">
            <span class="input-icon">✉️</span>
            <input 
              v-model="email" 
              type="email" 
              id="email" 
              placeholder="luffy@grandline.com" 
              required
              :disabled="authStore.actionLoading"
            />
          </div>
        </div>

        <div class="input-group">
          <label for="password">Contraseña Secreta</label>
          <div class="input-wrapper">
            <span class="input-icon">🔑</span>
            <input 
              v-model="password" 
              type="password" 
              id="password" 
              placeholder="Mínimo 6 caracteres" 
              required
              :disabled="authStore.actionLoading"
            />
          </div>
          
          <!-- Password Strength Meter -->
          <div v-if="password" class="strength-meter-container">
            <div class="strength-bars">
              <div 
                class="strength-bar" 
                v-for="bar in 3" 
                :key="bar"
                :style="{
                  backgroundColor: bar <= passwordStrength.score ? passwordStrength.color : '#2d3748',
                  boxShadow: bar <= passwordStrength.score ? `0 0 8px ${passwordStrength.color}` : 'none'
                }"
              ></div>
            </div>
            <span class="strength-label" :style="{ color: passwordStrength.color }">
              {{ passwordStrength.label }}
            </span>
          </div>
        </div>

        <div class="input-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input 
              v-model="confirmPassword" 
              type="password" 
              id="confirmPassword" 
              placeholder="Repite la contraseña" 
              required
              :disabled="authStore.actionLoading"
            />
          </div>
        </div>

        <!-- Pirate Code Checkbox -->
        <div class="checkbox-group">
          <label class="checkbox-container">
            <input 
              type="checkbox" 
              v-model="acceptPirateCode"
              :disabled="authStore.actionLoading"
            />
            <span class="checkmark"></span>
            <span class="checkbox-label">
              Juro respetar el <strong>Código Pirata</strong>, defender a mis camaradas y saquear con honor.
            </span>
          </label>
        </div>

        <button type="submit" class="btn-primary" :disabled="authStore.actionLoading">
          <span v-if="!authStore.actionLoading" class="btn-content">
            <span class="btn-icon">📜</span> ENROLARME AHORA
          </span>
          <span v-else class="spinner-container">
            <span class="custom-spinner"></span> Creando cartel Wanted...
          </span>
        </button>
      </form>

      <div class="card-footer">
        <p>¿Ya tienes tripulación? <router-link to="/login" class="login-link">Inicia Sesión</router-link></p>
        <router-link to="/" class="back-home-link">← Volver al Menú Principal</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Poppins:wght@300;400;600&display=swap');

.signup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  padding: 2rem 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  z-index: 100;
}

/* Background aesthetic */
.sea-mist {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 30%, rgba(20, 50, 80, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(5, 25, 45, 0.5) 0%, transparent 60%);
  z-index: 1;
  pointer-events: none;
}

.stormy-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #03080f;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7)),
    radial-gradient(ellipse at center, rgba(13, 30, 55, 0.8) 0%, #02050a 100%);
  z-index: 0;
}

/* Glassmorphic premium card */
.signup-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: rgba(4, 12, 22, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(212, 175, 55, 0.35);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6),
              0 0 30px rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  padding: 2.5rem;
  z-index: 2;
  box-sizing: border-box;
  margin: auto 1.5rem;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.signup-card:hover {
  border-color: rgba(212, 175, 55, 0.6);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7),
              0 0 40px rgba(212, 175, 55, 0.2);
}

/* Logo and titles */
.logo-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-title {
  font-family: 'Cinzel', serif;
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: 4px;
  background: linear-gradient(to bottom, #ffe699 0%, #d4af37 60%, #8a6d1c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(212, 175, 55, 0.25);
}

.logo-subtitle {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 6px;
  color: #c5b38f;
  text-transform: uppercase;
}

.gold-divider {
  width: 60px;
  height: 2px;
  background: linear-gradient(to right, transparent, #d4af37, transparent);
  margin: 0.8rem auto 0;
}

.card-intro {
  text-align: center;
  margin-bottom: 2rem;
}

.card-intro h3 {
  font-family: 'Cinzel', serif;
  font-size: 1.6rem;
  margin: 0 0 0.4rem;
  color: #fff;
  font-weight: 700;
  letter-spacing: 1px;
}

.card-intro p {
  font-size: 0.88rem;
  color: #a0aec0;
  margin: 0;
}

/* Alert system */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  animation: slideIn 0.3s ease;
  box-sizing: border-box;
}

.error-alert {
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid rgba(255, 77, 77, 0.5);
  box-shadow: 0 0 15px rgba(255, 77, 77, 0.15);
}

.success-alert {
  background: rgba(14, 54, 14, 0.2);
  border: 1px solid rgba(52, 168, 83, 0.5);
  box-shadow: 0 0 15px rgba(52, 168, 83, 0.15);
}

.alert-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.alert-text {
  font-size: 0.85rem;
  margin: 0;
  color: #edf2f7;
  line-height: 1.4;
}

/* Forms */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #c5b38f;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.1rem;
  color: #718096;
  pointer-events: none;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  background: rgba(3, 9, 20, 0.8);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 8px;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  color: #fff;
  font-size: 0.95rem;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  background: rgba(4, 14, 30, 0.9);
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Password Strength Meter styles */
.strength-meter-container {
  margin-top: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.strength-bars {
  display: flex;
  gap: 0.35rem;
  width: 100%;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background-color: #2d3748;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-align: right;
  transition: color 0.3s ease;
}

/* Checkbox Style */
.checkbox-group {
  margin: 0.5rem 0;
}

.checkbox-container {
  display: block;
  position: relative;
  padding-left: 2rem;
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1.4;
  color: #a0aec0;
  user-select: none;
  text-transform: none;
  letter-spacing: normal;
  font-weight: normal;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 2px;
  left: 0;
  height: 1.1rem;
  width: 1.1rem;
  background-color: rgba(3, 9, 20, 0.8);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: #d4af37;
  box-shadow: 0 0 5px rgba(212, 175, 55, 0.2);
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #d4af37;
  border-color: #d4af37;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 5px;
  top: 1.5px;
  width: 4px;
  height: 8px;
  border: solid #040c16;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-label strong {
  color: #d4af37;
}

/* Primary Button */
.btn-primary {
  background: linear-gradient(to right, #8a6d1c 0%, #d4af37 50%, #8a6d1c 100%);
  background-size: 200% auto;
  border: 1px solid #d4af37;
  border-radius: 8px;
  padding: 1rem;
  color: #040c16;
  font-size: 1.05rem;
  font-weight: 700;
  font-family: 'Cinzel', serif;
  letter-spacing: 2px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3),
              0 0 15px rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
}

.btn-primary:hover:not(:disabled) {
  background-position: right center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4),
              0 0 25px rgba(212, 175, 55, 0.45);
  transform: translateY(-2px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Spinner */
.spinner-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
}

.custom-spinner {
  width: 1.2rem;
  height: 1.2rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

/* Card footer */
.card-footer {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  border-top: 1px solid rgba(212, 175, 55, 0.15);
  padding-top: 1.2rem;
}

.card-footer p {
  font-size: 0.85rem;
  color: #a0aec0;
  margin: 0;
}

.login-link {
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s, text-shadow 0.2s;
}

.login-link:hover {
  color: #f1d592;
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
}

.back-home-link {
  font-size: 0.8rem;
  color: #718096;
  text-decoration: none;
  transition: color 0.2s;
  display: inline-block;
  margin-top: 0.4rem;
}

.back-home-link:hover {
  color: #d4af37;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
  .signup-card {
    padding: 1.75rem 1.25rem;
    margin: auto 1rem;
    border-radius: 12px;
  }
  
  .logo-title {
    font-size: 2.2rem;
  }
  
  .logo-subtitle {
    font-size: 0.95rem;
    letter-spacing: 4px;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"] {
    padding: 0.9rem 1rem 0.9rem 2.8rem; /* larger tap targets */
  }

  .btn-primary {
    padding: 1.1rem; /* larger tap target */
    margin-top: 0.75rem;
  }
  
  .checkbox-container {
    font-size: 0.78rem;
  }
}

@media (max-width: 480px) {
  .signup-card {
    padding: 1.5rem 1rem;
    margin: auto 0.75rem;
  }

  .logo-title {
    font-size: 2rem;
  }

  .logo-subtitle {
    font-size: 0.85rem;
    letter-spacing: 3px;
  }

  .card-intro h3 {
    font-size: 1.4rem;
  }

  .checkbox-container {
    font-size: 0.72rem;
  }
}
</style>
