import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signOut,
  updateProfile,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  type User
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const authService = {
  // 1. Email & Password Auth
  async registerWithEmailAndPassword(email: string, password: string, displayName: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update public profile name
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    return userCredential.user;
  },

  async loginWithEmailAndPassword(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // 2. Social Auth Providers
  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  },

  async loginWithDiscord(): Promise<User> {
    const provider = new OAuthProvider('discord.com');
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  },

  async loginWithGithub(): Promise<User> {
    const provider = new GithubAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  },

  // 3. Password Reset & Verification
  async sendPasswordReset(email: string): Promise<void> {
    return firebaseSendPasswordResetEmail(auth, email);
  },

  async sendEmailVerification(user: User): Promise<void> {
    return firebaseSendEmailVerification(user);
  },

  // 4. Session Actions
  async logout(): Promise<void> {
    return signOut(auth);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // 5. Spanish Thematic Error Mapper
  mapAuthError(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido. ¡Escríbelo bien, pirata!';
      case 'auth/user-disabled':
        return 'Tu cuenta ha sido clausurada por la Marina (Cuenta inhabilitada).';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Credenciales incorrectas. No encontramos ningún pirata registrado con estos datos.';
      case 'auth/wrong-password':
        return 'La contraseña no coincide. ¡Prueba otra combinación!';
      case 'auth/email-already-in-use':
        return '¡Ese correo ya tiene tripulación! Prueba a iniciar sesión.';
      case 'auth/weak-password':
        return 'Tu contraseña es demasiado débil. ¡Debe tener al menos 6 caracteres!';
      case 'auth/too-many-requests':
        return '¡Demasiados disparos fallidos! Tu cuenta ha sido bloqueada temporalmente por seguridad.';
      case 'auth/network-request-failed':
        return 'Error de red. ¡Una tormenta eléctrica interrumpió la conexión al servidor!';
      case 'auth/popup-closed-by-user':
        return 'Cerraste la ventana emergente antes de completar el pacto social.';
      default:
        return '¡Ocurrió un remolino inesperado en el servidor! Inténtalo más tarde.';
    }
  }
};
