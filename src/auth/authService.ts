import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
 

class AuthService {
  // Email/Password Authentication
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Google Authentication
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
      });

      if (response?.type === 'success') {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential;
      } else {
        throw new Error('Google sign-in was cancelled');
      }
    } catch (error: any) {
      throw new Error('Google sign-in failed');
    }
  }

  // Apple Authentication
  async signInWithApple(): Promise<UserCredential> {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.authorizationCode) {
        const provider = new OAuthProvider('apple.com');
        const appleCredential = provider.credential({
          idToken: credential.identityToken!,
          rawNonce: credential.nonce,
        });

        const userCredential = await signInWithCredential(auth, appleCredential);
        return userCredential;
      } else {
        throw new Error('Apple sign-in was cancelled');
      }
    } catch (error: any) {
      throw new Error('Apple sign-in failed');
    }
  }

  // Auth State Listener
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Error message helper
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export const authService = new AuthService();
export default authService;
