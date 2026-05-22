<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const validationError = ref<string | null>(null);

const handleLogin = async () => {
  validationError.value = null;
  
  if (!email.value || !password.value) {
    validationError.value = '¡Escribe tu correo y contraseña, pirata! No puedes zarpar sin credenciales.';
    return;
  }
  
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/');
  }
};

const handleSocialLogin = async (provider: 'google' | 'discord' | 'github') => {
  validationError.value = null;
  const success = await authStore.loginSocial(provider);
  if (success) {
    router.push('/');
  }
};
</script>

<template>
  <div class="login-container">
    <!-- Animated background layers -->
    <div class="sea-mist"></div>
    <div class="stormy-bg"></div>

    <div class="login-card">
      <div class="logo-section">
        <h1 class="logo-title">One Piece</h1>
        <h2 class="logo-subtitle">Grand Line Chess</h2>
        <div class="gold-divider"></div>
      </div>

      <div class="card-intro">
        <h3>Inicia Sesión</h3>
        <p>Prepara tu tripulación para cruzar el Nuevo Mundo</p>
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

      <form @submit.prevent="handleLogin" class="auth-form">
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
          <div class="label-row">
            <label for="password">Contraseña</label>
            <router-link to="/forgot-password" class="forgot-pass-link">¿Olvidaste tu mapa? (Recuperar)</router-link>
          </div>
          <div class="input-wrapper">
            <span class="input-icon">🔑</span>
            <input 
              v-model="password" 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              required
              :disabled="authStore.actionLoading"
            />
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="authStore.actionLoading">
          <span v-if="!authStore.actionLoading" class="btn-content">
            <span class="btn-icon">🌊</span> ¡ZARPAR AL COMBATE!
          </span>
          <span v-else class="spinner-container">
            <span class="custom-spinner"></span> Iniciando travesía...
          </span>
        </button>
      </form>

      <div class="social-auth-section">
        <div class="social-divider">
          <span>O PACTA ALIANZAS CON</span>
        </div>

        <div class="social-buttons">
          <button 
            @click="handleSocialLogin('google')" 
            class="social-btn google-btn"
            :disabled="authStore.actionLoading"
            title="Iniciar sesión con Google"
            type="button"
          >
            <svg class="social-svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.66 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z"/>
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.58v2.99h3.89c2.28-2.1 3.56-5.18 3.56-8.72z"/>
              <path fill="#FBBC05" d="M5.24 10.55a6.979 6.979 0 0 1 0 2.9l-3.85 2.99C.51 14.91 0 13.51 0 12c0-1.51.51-2.91 1.39-4.44l3.85 2.99z"/>
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.89-2.99c-1.1.74-2.52 1.18-4.07 1.18-3.36 0-5.86-1.81-6.76-4.51L1.39 16.75C3.37 20.35 7.35 23 12 23z"/>
            </svg>
            <span>Google</span>
          </button>

          <button 
            @click="handleSocialLogin('discord')" 
            class="social-btn discord-btn"
            :disabled="authStore.actionLoading"
            title="Iniciar sesión con Discord"
            type="button"
          >
            <svg class="social-svg" viewBox="0 0 127.14 96.36" width="24" height="24" fill="#FFFFFF">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.88-.65,1.72-1.34,2.51-2a75.58,75.58,0,0,0,73,0c.8.69,1.63,1.38,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.07,50.12,122.9,27.35,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
            </svg>
            <span>Discord</span>
          </button>

          <button 
            @click="handleSocialLogin('github')" 
            class="social-btn github-btn"
            :disabled="authStore.actionLoading"
            title="Iniciar sesión con GitHub"
            type="button"
          >
            <svg class="social-svg" viewBox="0 0 24 24" width="24" height="24" fill="#FFFFFF">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </button>
        </div>
      </div>

      <div class="card-footer">
        <p>¿Nuevo en este mar? <router-link to="/signup" class="signup-link">Únete a la tripulación (Regístrate)</router-link></p>
        <router-link to="/" class="back-home-link">← Volver al Menú Principal</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Poppins:wght@300;400;600&display=swap');

.login-container {
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
  background: radial-gradient(circle at 30% 20%, rgba(20, 50, 80, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(5, 25, 45, 0.5) 0%, transparent 60%);
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
.login-card {
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

.login-card:hover {
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
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #c5b38f;
  font-weight: 600;
}

.forgot-pass-link {
  font-size: 0.75rem;
  color: #d4af37;
  text-decoration: none;
  transition: color 0.2s, text-shadow 0.2s;
}

.forgot-pass-link:hover {
  color: #f1d592;
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
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

input {
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

input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  background: rgba(4, 14, 30, 0.9);
}

input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Social Login Section */
.social-auth-section {
  margin-top: 2rem;
}

.social-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 1.2rem;
}

.social-divider::before,
.social-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}

.social-divider span {
  padding: 0 0.75rem;
  font-size: 0.68rem;
  letter-spacing: 1.5px;
  color: #a0aec0;
  font-weight: bold;
}

.social-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
}

.social-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  padding: 0.65rem 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #edf2f7;
  font-family: inherit;
  font-size: 0.75rem;
  box-sizing: border-box;
}

.social-btn:hover:not(:disabled) {
  background: rgba(212, 175, 55, 0.08);
  transform: translateY(-2px);
}

.social-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.social-svg {
  transition: transform 0.3s ease;
}

.social-btn:hover:not(:disabled) .social-svg {
  transform: scale(1.1);
}

/* Custom Social Button Highlights */
.google-btn:hover:not(:disabled) {
  border-color: rgba(234, 67, 53, 0.5);
  box-shadow: 0 0 10px rgba(234, 67, 53, 0.15);
  background: rgba(234, 67, 53, 0.04);
}

.discord-btn {
  background: rgba(88, 101, 242, 0.1);
}

.discord-btn:hover:not(:disabled) {
  border-color: rgba(88, 101, 242, 0.6);
  box-shadow: 0 0 10px rgba(88, 101, 242, 0.25);
  background: rgba(88, 101, 242, 0.2);
}

.github-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
}

/* Card footer */
.card-footer {
  margin-top: 2.2rem;
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

.signup-link {
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s, text-shadow 0.2s;
}

.signup-link:hover {
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
  .login-card {
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

  .label-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
  }

  .social-buttons {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .social-btn {
    flex-direction: row;
    padding: 0.8rem;
    font-size: 0.85rem;
    gap: 0.75rem;
  }
  
  input {
    padding: 0.9rem 1rem 0.9rem 2.8rem; /* larger tap targets for mobile */
  }

  .btn-primary {
    padding: 1.1rem; /* larger tap target */
    margin-top: 0.75rem;
  }
}

@media (max-width: 480px) {
  .login-card {
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
}
</style>
