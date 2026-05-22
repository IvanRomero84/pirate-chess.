import { defineStore } from 'pinia';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase/config';
import { authService } from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    loading: true,         // Initial page load checking
    actionLoading: false,  // Spinner loader for submit buttons
    errorMessage: null as string | null,
    successMessage: null as string | null,
  }),

  actions: {
    // Initializes onAuthStateChanged and returns a promise that resolves upon the first check
    init(): Promise<User | null> {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          this.user = user;
          this.loading = false;
          resolve(user);
        });
      });
    },

    clearMessages() {
      this.errorMessage = null;
      this.successMessage = null;
    },

    async register(email: string, password: string, username: string) {
      this.actionLoading = true;
      this.clearMessages();
      try {
        const user = await authService.registerWithEmailAndPassword(email, password, username);
        this.user = user;
        this.successMessage = '¡Tripulación registrada con éxito! Bienvenido al barco.';
        return true;
      } catch (error: any) {
        this.errorMessage = authService.mapAuthError(error.code);
        console.error('Registration failed', error);
        return false;
      } finally {
        this.actionLoading = false;
      }
    },

    async login(email: string, password: string) {
      this.actionLoading = true;
      this.clearMessages();
      try {
        const user = await authService.loginWithEmailAndPassword(email, password);
        this.user = user;
        this.successMessage = 'Sesión iniciada. ¡Listo para zarpar!';
        return true;
      } catch (error: any) {
        this.errorMessage = authService.mapAuthError(error.code);
        console.error('Login failed', error);
        return false;
      } finally {
        this.actionLoading = false;
      }
    },

    async loginSocial(provider: 'google' | 'discord' | 'github') {
      this.actionLoading = true;
      this.clearMessages();
      try {
        let user;
        if (provider === 'google') {
          user = await authService.loginWithGoogle();
        } else if (provider === 'discord') {
          user = await authService.loginWithDiscord();
        } else if (provider === 'github') {
          user = await authService.loginWithGithub();
        }
        
        if (user) {
          this.user = user;
          this.successMessage = `¡Bienvenido a bordo, ${user.displayName || 'Pirata'}!`;
          return true;
        }
        return false;
      } catch (error: any) {
        this.errorMessage = authService.mapAuthError(error.code);
        console.error(`Social login failed for ${provider}`, error);
        return false;
      } finally {
        this.actionLoading = false;
      }
    },

    async resetPassword(email: string) {
      this.actionLoading = true;
      this.clearMessages();
      try {
        await authService.sendPasswordReset(email);
        this.successMessage = 'Te hemos enviado una botella con instrucciones a tu correo para restablecer tu contraseña.';
        return true;
      } catch (error: any) {
        this.errorMessage = authService.mapAuthError(error.code);
        console.error('Password reset failed', error);
        return false;
      } finally {
        this.actionLoading = false;
      }
    },

    async logout() {
      this.actionLoading = true;
      this.clearMessages();
      try {
        await authService.logout();
        this.user = null;
        this.successMessage = 'Has abandonado la Grand Line con éxito. ¡Vuelve pronto!';
      } catch (error: any) {
        this.errorMessage = 'No se pudo cerrar la sesión de forma limpia.';
        console.error('Logout failed', error);
      } finally {
        this.actionLoading = false;
      }
    }
  }
});
