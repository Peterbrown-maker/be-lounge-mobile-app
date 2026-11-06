import { initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnCsX7Gnl5hQ1UY6SN1RZYuiZqXjAZARI",
  authDomain: "flavor-hos-delivery.firebaseapp.com",
  projectId: "flavor-hos-delivery",
  storageBucket: "flavor-hos-delivery.firebasestorage.app",
  messagingSenderId: "1036842544092",
  appId: "1:1036842544092:web:ce133f5515ba55915cfd19",
  measurementId: "G-SQWJY981QR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
// On native, persist the session in AsyncStorage so users stay logged in across restarts.
// getReactNativePersistence only exists in Firebase's React Native build (which Metro
// picks at runtime), so it isn't in the web typings — hence the require.
let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export default app;
