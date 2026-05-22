import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import GameView from '../views/GameView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/MainMenuView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/SignupView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/lobby',
    name: 'Lobby',
    component: () => import('../views/LobbyView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/game',
    name: 'Game',
    component: GameView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de Navegación para proteger rutas de la Grand Line
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Si la tienda aún no ha escuchado a Firebase, esperamos a que inicialice
  if (authStore.loading) {
    await authStore.init();
  }

  const isAuthenticated = !!authStore.user;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      // Si requiere autenticación y no está logueado, al calabozo (Login)
      next({ name: 'Login' });
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    if (isAuthenticated) {
      // Si es solo para invitados y ya está logueado, al barco principal (Home)
      next({ name: 'Home' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

